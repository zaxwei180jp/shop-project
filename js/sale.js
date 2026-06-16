import { renderCard } from "./cardUtils.js";

const API_URL = "https://shop-project-azure.vercel.app/api/products";
const el = document.getElementById("list");

async function init() {
  const res = await fetch(API_URL, { cache: "no-store" });
  let data = await res.json();

  data = data.filter(p => p.isSale);
  const mainOrder = [];
  data.forEach(p => {
    if (p.mainCategory && !mainOrder.includes(p.mainCategory))
      mainOrder.push(p.mainCategory);
  });
  data.sort((a, b) => {
    const mi = mainOrder.indexOf(a.mainCategory ?? "");
    const mj = mainOrder.indexOf(b.mainCategory ?? "");
    if (mi !== mj) return mi - mj;
    const sa = a.sort || 9999;
    const sb = b.sort || 9999;
    if (sa !== sb) return sa - sb;
    return new Date(b.update || b.createdTime) - new Date(a.update || a.createdTime);
  });

  el.innerHTML = data.length
    ? `<div class="product-grid">${data.map(renderCard).join("")}</div>`
    : `<div style="padding:60px 0;text-align:center;color:var(--gray-400)">沒有特價商品</div>`;
}

init();
