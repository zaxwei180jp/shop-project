document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ JS 已載入");

  fetch("/api/products")
    .then(res => res.json())
    .then(data => {

      console.log("商品資料:", data);

      // ⭐ 用標題判斷是不是首頁（最穩）
      const title = document.querySelector("h1")?.innerText || "";
      const isHome = title.includes("新商品");

      // ⭐ 首頁只顯示3個
      if (isHome) {
        data = data.slice(0, 3);
      }

      renderProducts(data);

    })
    .catch(err => console.error("❌ API錯誤:", err));

});


function renderProducts(products) {
  const list = document.getElementById("product-list");

  if (!list) {
    console.error("❌ 找不到 product-list");
    return;
  }

  list.innerHTML = "";

  products.forEach(p => {
    list.innerHTML += `
      <div class="bg-white p-4 rounded-2xl shadow">
        <img src="${p.image}" class="w-full h-40 object-cover rounded-xl mb-3">
        <h3 class="font-bold text-lg">${p.name}</h3>
        <p class="text-gray-500">NT$${p.price}</p>
        <button onclick="addToCart('${p.id}')"
          class="mt-3 bg-black text-white px-4 py-2 rounded-xl w-full">
          加入購物車
        </button>
      </div>
    `;
  });
}


// ⭐ 一定要掛在 window（讓按鈕能用）
window.addToCart = function(id) {
  console.log("加入購物車:", id);

  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("已加入購物車");
};
