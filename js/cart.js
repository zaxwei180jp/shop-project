const API_URL = "https://shop-project-azure.vercel.app/api/products";

const el = document.getElementById("cart");

async function init() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");

  const res = await fetch(API_URL);
  const products = await res.json();

  let total = 0;

  const html = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id === id);
    if (!p) return "";

    const sub = p.price * qty;
    total += sub;

    // ⭐ 圖片邏輯
    const img = p.image || p.images?.[0] || "https://via.placeholder.com/80";

    return `
      <div class="flex items-center gap-4 border-b py-3">

        <!-- ⭐ 商品圖片 -->
        <img src="${img}" class="w-16 h-16 object-cover rounded">

        <!-- 商品資訊 -->
        <div class="flex-1">
          <div class="font-bold">${p.name}</div>
          <div class="text-sm text-gray-500">¥${p.price}</div>
        </div>

        <!-- ⭐ 數量控制 -->
        <div class="flex items-center gap-2">
          <button onclick="updateQty('${id}', -1)" class="px-2 border">-</button>
          <span>${qty}</span>
          <button onclick="updateQty('${id}', 1)" class="px-2 border">+</button>
        </div>

        <!-- 小計 -->
        <div class="w-24 text-right">
          ¥${sub}
        </div>

        <!-- 刪除 -->
        <button onclick="removeItem('${id}')" class="text-red-500">
          ✕
        </button>

      </div>
    `;
  }).join("");

  el.innerHTML = `
    ${html || "購物車是空的"}
    <div class="text-right mt-4 font-bold text-xl">
      Total: ¥${total}
    </div>
  `;
}

// ⭐ 更新數量
window.updateQty = (id, change) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");

  cart[id] = (cart[id] || 0) + change;

  if (cart[id] <= 0) delete cart[id];

  localStorage.setItem("cart", JSON.stringify(cart));
  init();
};

// ⭐ 刪除
window.removeItem = (id) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  delete cart[id];
  localStorage.setItem("cart", JSON.stringify(cart));
  init();
};

init();