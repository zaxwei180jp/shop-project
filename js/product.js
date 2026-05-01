import { formatPrice } from "./utils.js";

const API_URL = "https://shop-project-azure.vercel.app/api/products";

const id = new URLSearchParams(location.search).get("id");
const el = document.getElementById("product");

async function init() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const p = data.find(x => x.id === id);

  const mainImg = p.image || p.images[0] || "https://via.placeholder.com/400";

  el.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">

      <div>
        <img id="mainImg" src="${mainImg}" class="w-full aspect-square object-cover">

        <div class="flex gap-2 mt-2">
          ${p.images.map(img => `
            <img src="${img}" class="w-16 aspect-square object-cover cursor-pointer thumb">
          `).join("")}
        </div>
      </div>

      <div>
        <h1 class="text-2xl font-bold">${p.name}</h1>

        ${p.isSale
          ? `<p class="text-red-500 mt-2 text-xl">
               ${formatPrice(p.price)}
               <span class="line-through text-gray-400 text-sm">${formatPrice(p.originalPrice)}</span>
             </p>`
          : `<p class="text-red-500 mt-2 text-xl">${formatPrice(p.price)}</p>`
        }

        <div class="flex items-center gap-3 mt-4">
          <button id="minus" class="px-3 border">-</button>
          <span id="qty">1</span>
          <button id="plus" class="px-3 border">+</button>
        </div>

        <button id="addBtn" class="mt-4 px-4 py-2 bg-black text-white">
          加入購物車
        </button>

        <div class="mt-6">
          ${renderDescriptionAdvanced(p.description)}
        </div>
      </div>

    </div>
  `;

  document.querySelectorAll(".thumb").forEach(img => {
    img.onclick = () =>
      document.getElementById("mainImg").src = img.src;
  });

  let qty = 1;
  const qtyEl = document.getElementById("qty");

  document.getElementById("plus").onclick = () => {
    qty++;
    qtyEl.innerText = qty;
  };

  document.getElementById("minus").onclick = () => {
    if (qty > 1) qty--;
    qtyEl.innerText = qty;
  };

  document.getElementById("addBtn").onclick = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    cart[p.id] = (cart[p.id] || 0) + qty;
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("已加入購物車");
    location.reload();
  };
}

init();