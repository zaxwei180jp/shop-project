// 假商品資料
const products = [
  {
    id: 1,
    name: "好市多洋芋片",
    price: 300,
    image: "https://via.placeholder.com/200"
  },
  {
    id: 2,
    name: "日本零食",
    price: 150,
    image: "https://via.placeholder.com/200"
  }
];

// 抓HTML容器
const list = document.getElementById("product-list");

// 顯示商品
products.forEach(p => {
  list.innerHTML += `
    <div class="bg-white p-4 rounded-2xl shadow">
      <img src="${p.image}" class="rounded-xl mb-3">
      <h3 class="font-bold">${p.name}</h3>
      <p class="text-gray-500">NT$${p.price}</p>
      <button onclick="addToCart(${p.id})"
        class="mt-3 bg-black text-white px-4 py-2 rounded-xl">
        加入購物車
      </button>
    </div>
  `;
});

// 加入購物車
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  if (cart[id]) {
    cart[id] += 1;
  } else {
    cart[id] = 1;
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("已加入購物車！");
}