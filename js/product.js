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

    el.innerHTML = `
      <img src="${product.image}" class="w-full h-64 object-cover rounded-xl mb-5">

      <h1 class="text-2xl font-bold mb-3">${product.name}</h1>

      <p class="text-xl text-gray-600 mb-4">NT$${product.price}</p>

      <p class="mb-6 whitespace-pre-line">${product.description}</p>

      <button onclick="addToCart('${product.id}')"
        class="bg-black text-white px-6 py-3 rounded-xl">
        加入購物車
      </button>
    `;
  });


// ⭐ 購物車功能（複製一份）
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  cart[id] = (cart[id] || 0) + 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("已加入購物車");
}