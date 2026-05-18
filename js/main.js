import { renderCard } from "./cardUtils.js";

const API_URL  = "https://shop-project-azure.vercel.app/api/products";
const el       = document.getElementById("list");
const mainTabs = document.getElementById("mainTabs");
const subTabs  = document.getElementById("subTabs");
const subWrap  = document.getElementById("subTabsWrap");

let allData    = [];
let activeMain = "全部";
let activeSub  = "全部";

async function init() {
  el.innerHTML = `<div class="col-span-2 text-center text-gray-400 py-10">載入中...</div>`;

  const res = await fetch(API_URL);
  allData   = await res.json();

  // ⭐ 記錄大分類出現的順序（Tab 順序）
  // ⭐ 固定「JC日本好市多」在第一位
  const mainOrder = ["JC日本好市多"];
  allData.forEach(p => {
    if (p.mainCategory && !mainOrder.includes(p.mainCategory))
      mainOrder.push(p.mainCategory);
  });

  // ⭐ 排序：先按大分類 Tab 順序，再按各自 sort
  allData.sort((a, b) => {
    const mi = mainOrder.indexOf(a.mainCategory ?? "");
    const mj = mainOrder.indexOf(b.mainCategory ?? "");
    if (mi !== mj) return mi - mj;
    const sa = a.sort || 9999;
    const sb = b.sort || 9999;
    if (sa !== sb) return sa - sb;
    return new Date(b.update || b.createdTime) - new Date(a.update || a.createdTime);
  });

  renderMainTabs();
  renderSubTabs();
  renderList();

  // ⭐ 首頁如果帶 ?q= 參數，轉到 search.html
  const urlQ = new URLSearchParams(location.search).get("q");
  if (urlQ) {
    window.location.replace("search.html?q=" + encodeURIComponent(urlQ));
  }
}

// ── 大分類 Tab ────────────────────────────────────────
function renderMainTabs() {
  const allMainSet = [...new Set(allData.map(p => p.mainCategory).filter(Boolean))];
  const mains = ["全部", "日本好市多", ...allMainSet.filter(m => m !== "日本好市多")];

  mainTabs.innerHTML = "";
  mains.forEach(cat => {
    const btn = makeTab(cat, cat === (activeMain || "全部"), false);
    btn.addEventListener("click", () => {
      activeMain = cat === "全部" ? "" : cat;
      activeSub  = "";
      renderMainTabs();
      renderSubTabs();
      renderList();
      if (cat !== "全部") scrollToList();
    });
    mainTabs.appendChild(btn);
  });
}

// ── 小分類 Tab ────────────────────────────────────────
function renderSubTabs() {
  // ⭐ 未選大分類時隱藏小分類
  if (!activeMain) {
    subWrap.classList.add("hidden");
    activeSub = "";
    return;
  }

  const pool = allData.filter(p => p.mainCategory === activeMain);

  const subs = ["全部", ...new Set(
    pool.map(p => p.category).filter(Boolean)
  )];

  if (subs.length <= 1) {
    subWrap.classList.add("hidden");
    return;
  }

  subWrap.classList.remove("hidden");
  subTabs.innerHTML = "";
  subs.forEach(cat => {
    const btn = makeTab(cat, cat === activeSub, true);
    btn.addEventListener("click", () => {
      activeSub = cat === "全部" ? "" : cat;
      renderSubTabs();
      renderList();
      scrollToList();
    });
    subTabs.appendChild(btn);
  });
}

// ── 商品列表 ──────────────────────────────────────────
function renderList() {
  let data = allData;

  if (activeMain)
    data = data.filter(p => p.mainCategory === activeMain);

  if (activeSub)
    data = data.filter(p => p.category === activeSub);

  el.innerHTML = data.length
    ? data.map(renderCard).join("")
    : `<div class="col-span-2 text-center text-gray-400 py-10">此分類沒有商品</div>`;
}

// ── Tab 按鈕（回傳 DOM 元素，不用 outerHTML）────────────
function makeTab(label, isActive, isSub) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = [
    "shrink-0 px-3 sm:px-4 py-1.5 rounded-full border transition",
    isSub ? "text-xs sm:text-sm" : "text-xs sm:text-sm font-medium",
    isActive
      ? (isSub ? "bg-gray-700 text-white border-gray-700" : "bg-black text-white border-black")
      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500 active:bg-gray-100",
  ].join(" ");
  return btn;
}

// ── 捲動到商品列表（避開 sticky navibar）────────────────
function scrollToList() {
  const listEl = document.getElementById("list");
  const navH   = document.querySelector(".sticky")?.offsetHeight || 48;
  const top    = listEl.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top, behavior: "smooth" });
}

init();

// ── 搜尋功能 ─────────────────────────────────────────
let searchKeyword = "";

window.handleNavSearch = (val) => {
  searchKeyword = val.trim().toLowerCase();
  if (!searchKeyword) {
    restoreList();
    hideDropdown();
    return;
  }
  const results = searchProducts(searchKeyword);
  showDropdown(results);
  // 同時更新主列表
  renderSearchResults(results);
};

window.restoreList = () => {
  searchKeyword = "";
  renderMainTabs();
  renderSubTabs();
  renderList();
  hideDropdown();
};

function searchProducts(kw) {
  return allData.filter(p =>
    (p.name        || "").toLowerCase().includes(kw) ||
    (p.mainCategory|| "").toLowerCase().includes(kw) ||
    (p.category    || "").toLowerCase().includes(kw) ||
    (p.description || "").toLowerCase().includes(kw)
  );
}

function renderSearchResults(results) {
  el.innerHTML = results.length
    ? results.map(renderCard).join("")
    : `<div class="col-span-2 text-center text-gray-400 py-10">找不到「${searchKeyword}」相關商品</div>`;
}

// ── 下拉預覽（最多 5 筆）────────────────────────────
function showDropdown(results) {
  const dd = document.getElementById("searchDropdown");
  if (!dd) return;

  if (!results.length) {
    dd.innerHTML = `<div class="px-4 py-3 text-sm text-gray-400">找不到相關商品</div>`;
    dd.classList.remove("hidden");
    return;
  }

  const preview = results.slice(0, 5);
  dd.innerHTML = preview.map(p => {
    const imagesArr = Array.isArray(p.images) ? p.images : (p.images||"").split(",").map(s=>s.trim()).filter(Boolean);
    const img = p.image || imagesArr[0] || "";
    const highlight = (text) => {
      if (!text) return "";
      const re = new RegExp(`(${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, "gi");
      return text.replace(re, '<mark class="bg-yellow-100 text-yellow-800 rounded px-0.5">$1</mark>');
    };
    return `
      <a href="product.html?id=${p.id}" onclick="closeSearch()"
        class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 border-b last:border-0">
        ${img ? `<img src="${img}" class="w-10 h-10 object-cover rounded-lg shrink-0">` : ""}
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-800 truncate">${highlight(p.name)}</div>
          <div class="text-xs text-gray-400">${highlight(p.mainCategory || "")}${p.mainCategory && p.category ? " · " : ""}${highlight(p.category || "")}</div>
        </div>
        <div class="text-sm font-bold text-red-500 shrink-0">NT$ ${p.price?.toLocaleString()}</div>
      </a>`;
  }).join("");

  if (results.length > 5) {
    dd.innerHTML += `
      <a href="search.html?q=${encodeURIComponent(searchKeyword)}"
         class="block px-4 py-2 text-xs text-center text-black font-medium bg-gray-50 hover:bg-gray-100">
        查看全部 ${results.length} 筆結果 →
      </a>`;
  }

  dd.classList.remove("hidden");
}

function hideDropdown() {
  const dd = document.getElementById("searchDropdown");
  if (dd) { dd.classList.add("hidden"); dd.innerHTML = ""; }
}
