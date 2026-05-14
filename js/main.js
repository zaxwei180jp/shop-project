import { renderCard } from "./cardUtils.js";

const API_URL = "https://shop-project-azure.vercel.app/api/products";
const el = document.getElementById("list");

async function init() {
  el.innerHTML = `<div class="col-span-2 text-center text-gray-400 py-10">載入中...</div>`;

  const res = await fetch(API_URL);
  let data = await res.json();

  data.sort((a, b) =>
    new Date(b.update || b.createdTime) -
    new Date(a.update || a.createdTime)
  );

  el.innerHTML = data.length
    ? data.map(renderCard).join("")
    : `<div class="col-span-2 text-center text-gray-400 py-10">目前沒有商品</div>`;
}

init();
