import { formatPrice } from "./utils.js";

const API_URL = "/api/products";
const el = document.getElementById("list");

async function init() {
  const res = await fetch(API_URL);
  let data = await res.json();

  // ⭐ 強制轉 boolean
  data = data.filter(p => Boolean(p.hot));

  if (!data.length) {
    el.innerHTML = "<p>目前沒有熱賣商品</p>";
    return;
  }

  el.innerHTML = data.map(p => {
    const img = p.image || "https://via.placeholder.com/400";

    return `
      <a href="product.html?id=${p.id}" class="block border p-2">
        <img src="${img}" class="w-full aspect-square object-cover">

        <div class="mt-2 font-bold">${p.name}</div>

        <div class="text-red-500">
          ${formatPrice(p.price)}
        </div>
      </a>
    `;
  }).join("");
}

init();