let allProducts = [];
let currentCategory = "all";
let currentKeyword = "";
let currentSort = "default";

document.addEventListener("DOMContentLoaded", () => {

  fetch("/api/products")
    .then(res => res.json())
    .then(data => {

      allProducts = data;

      renderCategories(allProducts);
      renderProducts(allProducts);

    })
    .catch(err => console.error("API錯:", err));


  // ⭐ 等 DOM 存在再綁事件（修正重點）
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentKeyword = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

});


// ⭐ 核心：分類 + 搜尋 + 排序
function applyFilters() {

  let result = [...allProducts];

  // 分類
  if (currentCategory !== "all") {
    result = result.filter(p => p.category === currentCategory);
  }

  // 搜尋
  if (currentKeyword) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(currentKeyword)
    );
  }

  // ⭐ 排序（這裡已確認可用）
  if (currentSort === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  }

  renderProducts(result);
}


// ⭐ 商品顯示
function renderProducts(products) {
  const list = document.getElementById("product-list");
  if (!list) return;

  list.innerHTML = "";

  products.forEach(p => {
    list.innerHTML += `
      <div class="bg-white p-4 rounded-2xl shadow">
        
        <img src="${p.image}"
          class="w-full h-40 object-cover rounded-xl mb-3 cursor-pointer"
          onclick="goToProduct('${p.id}')">

        <h3 class="font-bold text-lg cursor-pointer"
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


// ⭐ 分類生成（動態）
function renderCategories(products) {

  const container = document.getElementById("category-list");
  if (!container) return;

  const categories = [...new Set(products.map(p => p.category))];

  let html = `
    <button onclick="filterCategory('all')"
      class="px-4 py-2 bg-black text-white rounded">
      全部
    </button>
  `;

  categories.forEach(cat => {
    html += `
      <button onclick="filterCategory('${cat}')"
        class="px-4 py-2 bg-gray-200 rounded">
        ${cat}
      </button>
    `;
  });

  container.innerHTML = html;
}


// ⭐ 分類點擊
window.filterCategory = function(category) {
  currentCategory = category;
  applyFilters();
};


// ⭐ 購物車
window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("已加入購物車");
};


// ⭐ 商品詳情頁
window.goToProduct = function(id) {
  window.location.href = `/product.html?id=${id}`;
};