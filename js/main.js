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
        // ⭐ 首頁：新商品
        const newProducts = allProducts.filter(p => p.isNew === true);

        if (newProducts.length > 0) {
          renderProducts(newProducts);
        } else {
          renderProducts(allProducts.slice(0, 3));
        }

      } else {
        // ⭐ 商品頁
        setupFilters();
        renderProducts(allProducts);
      }
    });
});


// ⭐ 設定篩選功能
function setupFilters() {

  const categoryFilter = document.getElementById("categoryFilter");
  const sortOption = document.getElementById("sortOption");

  if (!categoryFilter || !sortOption) return;

  categoryFilter.addEventListener("change", applyFilters);
  sortOption.addEventListener("change", applyFilters);
}


// ⭐ 套用篩選 + 排序
function applyFilters() {

  let filtered = [...allProducts];

  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortOption").value;

  // 篩選分類
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // 排序
  if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (sort === "new") {
    // 預設 Notion 新的在前（通常已經是）
    filtered.reverse();
  }

  renderProducts(filtered);
}


// ⭐ 渲染商品
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


// ⭐ 跳轉商品頁
window.goToProduct = function(id) {
  window.location.href = `/product.html?id=${id}`;
};


// ⭐ 購物車
window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("已加入購物車");
};