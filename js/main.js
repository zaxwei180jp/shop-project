import { renderCard } from "./cardUtils.js";

const API_URL  = "https://shop-project-azure.vercel.app/api/products";
const mainTabs = document.getElementById("mainTabs");
const subTabs  = document.getElementById("subTabs");
const subWrap  = document.getElementById("subTabsWrap");
const listWrap = document.getElementById("listWrap");

let allData    = [];
let activeMain = "全部";
let activeSub  = "全部";

(async () => {
  listWrap.innerHTML = `<div style="padding:60px 0;text-align:center;color:var(--gray-400);font-size:15px">載入中...</div>`;
  try {
    const res = await fetch(API_URL);
    allData = (await res.json()).filter(p => p.isView !== false);
  } catch {
    listWrap.innerHTML = `<div style="padding:60px 0;text-align:center;color:var(--gray-400)">載入失敗，請重新整理</div>`;
    return;
  }

  const urlParams = new URLSearchParams(location.search);
  const urlMain   = urlParams.get("main");
  const urlQ      = urlParams.get("q");
  if (urlQ) { location.replace("search.html?q=" + encodeURIComponent(urlQ)); return; }

  renderMainTabs();

  if (urlMain && allData.some(p => p.mainCategory === urlMain)) {
    activeMain = urlMain;
    activeSub  = "全部";
    renderSubTabs();
    renderList();
    history.replaceState(null, "", "index.html");
  } else {
    renderSubTabs();
    renderList();
  }
})();

function makeTab(label, isActive, isSub) {
  const btn = document.createElement("button");
  btn.textContent = label;
  const base = "border-radius:8px;font-weight:600;text-align:center;cursor:pointer;border:1.5px solid;transition:all 0.15s;white-space:nowrap;flex-shrink:0;";
  const size = isSub
    ? "padding:10px 14px;font-size:14px;"
    : "padding:12px 18px;font-size:14px;";
  const color = isActive
    ? "background:#111;color:#fff;border-color:#111;"
    : "background:#fff;color:#111;border-color:#e5e5e5;";
  btn.style.cssText = base + size + color;
  btn.dataset.active = isActive ? "1" : "0";
  return btn;
}

function renderMainTabs() {
  // 強制 grid 樣式
  mainTabs.style.cssText = "display:flex;gap:8px;padding:12px;overflow-x:auto;scrollbar-width:none;background:#fff;border-bottom:1px solid #e5e5e5;-webkit-overflow-scrolling:touch";
  const cats = ["全部", ...new Set(allData.map(p => p.mainCategory).filter(Boolean))];
  mainTabs.innerHTML = "";
  cats.forEach(cat => {
    const btn = makeTab(cat, cat === activeMain, false);
    btn.addEventListener("click", () => {
      activeMain = cat; activeSub = "全部";
      renderMainTabs(); renderSubTabs(); renderList();
    });
    mainTabs.appendChild(btn);
  });
}

function renderSubTabs() {
  if (activeMain === "全部") { subWrap.style.display = "none"; return; }
  const pool = allData.filter(p => p.mainCategory === activeMain);
  const subs = ["全部", ...new Set(pool.map(p => p.category).filter(Boolean))];
  if (subs.length <= 1) { subWrap.style.display = "none"; return; }
  subWrap.style.display = "block";
  subTabs.style.cssText = "display:flex;gap:8px;padding:10px;overflow-x:auto;scrollbar-width:none;background:#f9f9f9;border-bottom:1px solid #e5e5e5;-webkit-overflow-scrolling:touch";
  subTabs.innerHTML = "";
  subs.forEach(cat => {
    const btn = makeTab(cat, cat === activeSub, true);
    btn.addEventListener("click", () => {
      activeSub = cat; renderSubTabs(); renderList();
    });
    subTabs.appendChild(btn);
  });
}

function renderList() {
  let data = [...allData];
  if (activeMain !== "全部") data = data.filter(p => p.mainCategory === activeMain);
  if (activeSub  !== "全部") data = data.filter(p => p.category === activeSub);

  if (activeMain === "全部") {
    // 大分類分列顯示
    const cats = [...new Set(allData.map(p => p.mainCategory).filter(Boolean))];
    let html = "";
    cats.forEach(cat => {
      const items = allData.filter(p => p.mainCategory === cat && p.isView !== false);
      if (!items.length) return;
      const hasMore = items.length > 4;
      const show = items.slice(0, hasMore ? 4 : items.length);
      html += `<div class="section-title">${cat}</div>`;
      html += `<div class="product-grid${hasMore ? ' has-more' : ''}">`;
      show.forEach(p => { html += renderCard(p); });
      if (hasMore) {
        html += `<a href="index.html?main=${encodeURIComponent(cat)}" class="product-card more-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:120px;color:var(--gray-500);font-size:14px;font-weight:500;text-decoration:none;background:var(--gray-50)"><span style="font-size:28px;line-height:1">→</span>查看全部<span style="font-size:13px">${items.length} 件</span></a>`;
      }
      html += `</div>`;
    });
    listWrap.innerHTML = html || `<div style="padding:60px 0;text-align:center;color:var(--gray-400)">暫無商品</div>`;
  } else {
    if (!data.length) {
      listWrap.innerHTML = `<div style="padding:60px 0;text-align:center;color:var(--gray-400)">暫無商品</div>`;
      return;
    }
    listWrap.innerHTML = `<div class="product-grid">${data.map(renderCard).join("")}</div>`;
  }
}
