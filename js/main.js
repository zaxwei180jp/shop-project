let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {

  console.log("JS OK");

  fetch("/api/products")
    .then(res => res.json())
    .then(data => {

      allProducts = data;

      // ⭐ 建立分類
      renderCategories(allProducts);

      const title = document.querySelector("h1")?.innerText || "";
      const isHome = title.includes("新商品");

      if (isHome) {
        data = data.slice(0, 3);
      }

      renderProducts(data);

    })
    .catch(err => console.error("API錯:", err));

});


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


// ⭐ 動態分類產生
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


// ⭐ 分類篩選
window.filterCategory = function(category) {

  if (category === "all") {
    renderProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(p => p.category === category);
  renderProducts(filtered);
};


// ⭐ 加入購物車
window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("已加入購物車");
};


// ⭐ 商品詳情頁跳轉
window.goToProduct = function(id) {
  window.location.href = `/product.html?id=${id}`;
};