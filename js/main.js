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

  allData.sort((a, b) =>
    new Date(b.update || b.createdTime) -
    new Date(a.update || a.createdTime)
  );

  renderMainTabs();
  renderSubTabs();
  renderList();
}

// ── 大分類 Tab ────────────────────────────────────────
function renderMainTabs() {
  const mains = ["全部", ...new Set(
    allData.map(p => p.mainCategory).filter(Boolean)
  )];

  mainTabs.innerHTML = "";
  mains.forEach(cat => {
    const btn = makeTab(cat, cat === activeMain, false);
    btn.addEventListener("click", () => {
      activeMain = cat;
      activeSub  = "全部";
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
  const pool = activeMain === "全部"
    ? allData
    : allData.filter(p => p.mainCategory === activeMain);

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
      activeSub = cat;
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

  if (activeMain !== "全部")
    data = data.filter(p => p.mainCategory === activeMain);

  if (activeSub !== "全部")
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
