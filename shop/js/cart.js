// 商品資料
const products = [
  {
    id: 1,
    name: "好市多洋芋片",
    price: 300,
    image: "https://via.placeholder.com/100"
  },
  {
    id: 2,
    name: "日本零食",
    price: 150,
    image: "https://via.placeholder.com/100"
  }
];

// 讀取購物車（現在是物件）
let cart = JSON.parse(localStorage.getItem("cart")) || {};

const container = document.getElementById("cart-items");
const totalEl = document.getElementById("total");

// 渲染購物車
function renderCart() {
  container.innerHTML = "";
  let total = 0;

  Object.keys(cart).forEach(id => {
    const p = products.find(p => p.id == id);
    if (!p) return;

    const qty = cart[id];
    const subtotal = p.price * qty;

    total += subtotal;

    container.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow flex justify-between items-center">
        
        <div class="flex items-center gap-4">
          <img src="${p.image}" class="w-16 h-16 rounded">
          <div>
            <h3>${p.name}</h3>
            <p>NT$${p.price}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="decrease(${id})" class="px-2 bg-gray-200">-</button>
          <span>${qty}</span>
          <button onclick="increase(${id})" class="px-2 bg-gray-200">+</button>
          <button onclick="removeItem(${id})" class="text-red-500 ml-3">刪除</button>
        </div>

      </div>
    `;
  });

  totalEl.innerText = total;
}

// +1
function increase(id) {
  cart[id] += 1;
  save();
}

// -1
function decrease(id) {
  if (cart[id] > 1) {
    cart[id] -= 1;
  } else {
    delete cart[id];
  }
  save();
}

// 刪除
function removeItem(id) {
  delete cart[id];
  save();
}

// 存檔＋刷新
function save() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// 初始化
renderCart();