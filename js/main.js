let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/products")
    .then(res => res.json())
    .then(data => {

      allProducts = data;

      const path = window.location.pathname;

      const isHome =
        path === "/" ||
        path.includes("index.html");

      if (isHome) {
        // ⭐ 首頁：只顯示 isNew
        const newProducts = allProducts.filter(p => p.isNew === true);

        // 如果沒設 isNew，就顯示前3個避免空白
        if (newProducts.length > 0) {
          renderProducts(newProducts);
        } else {
          renderProducts(allProducts.slice(0, 3));
        }

      } else {
        // ⭐ 商品頁：全部
        renderProducts(allProducts);
      }
    })
    .catch(err => console.error("API錯:", err));
});

function renderProducts(products) {
  const list = document.getElementById("product-list");
  if (!list) return;

  list.innerHTML = "";

  products.forEach(p => {
    list.innerHTML += `
      <div class="bg-white p-4 rounded-2xl shadow">
        
        <img src="${p.image || 'https://picsum.photos/300'}"
          class="w-full h-40 object-cover rounded-xl mb-3 cursor-pointer"
          onclick="goToProduct('${p.id}')">

        <h3 class="font-bold cursor-pointer"
          onclick="goToProduct('${p.id}')">
          ${p.name}
        </h3>

        <p class="text-gray-500">NT$${p.price}</p>

        <button onclick="addToCart('${p.id}')"
          class="mt-3 bg-black text-white px-4 py-2 rounded-xl w-full">
          加入購物車
        </button>

      </div>
    `;
  });
}

window.goToProduct = function(id) {
  window.location.href = `/product.html?id=${id}`;
};

window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("已加入購物車");
};