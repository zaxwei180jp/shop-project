const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch("/api/products")
  .then(res => res.json())
  .then(data => {

    const product = data.find(p => p.id === id);
    const el = document.getElementById("product-detail");

    if (!product) {
      el.innerHTML = "<p>找不到商品</p>";
      return;
    }

    // ⭐ 圖片處理
    let images = product.images || [];

    // 把主圖放第一張
    if (product.image && !images.includes(product.image)) {
      images.unshift(product.image);
    }

    // fallback
    if (images.length === 0) {
      images = ["https://picsum.photos/500"];
    }

    // ⭐ 縮圖
    let thumbnails = images.map(img => `
      <img src="${img}"
        style="width:80px; aspect-ratio:1/1; object-fit:cover;"
        class="rounded cursor-pointer border hover:border-black"
        onclick="changeImage('${img}')">
    `).join("");

    // ⭐ 主畫面（RWD + 正方形）
    el.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">

        <!-- 圖片區 -->
        <div>
          <img id="main-image"
            src="${images[0]}"
            style="width:100%; aspect-ratio:1/1; object-fit:cover;"
            class="rounded-xl mb-4">

          <div class="flex gap-2 flex-wrap">
            ${thumbnails}
          </div>
        </div>

        <!-- 資訊區 -->
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-3">${product.name}</h1>
          <p class="text-xl text-gray-600 mb-4">NT$${product.price}</p>
          <p class="mb-6 whitespace-pre-line">${product.description}</p>

          <button onclick="addToCart('${product.id}')"
            class="bg-black text-white px-6 py-3 rounded-xl w-full md:w-auto">
            加入購物車
          </button>
        </div>

      </div>
    `;
  });


// ⭐ 切換圖片
window.changeImage = function(src) {
  document.getElementById("main-image").src = src;
};


// ⭐ 購物車
window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("已加入購物車");
};