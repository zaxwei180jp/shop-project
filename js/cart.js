document.addEventListener("DOMContentLoaded", renderCart);

function renderCart() {

  const container = document.getElementById("cart-list");
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || {};

  if (Object.keys(cart).length === 0) {
    container.innerHTML = "<p class='text-gray-500'>購物車是空的</p>";
    return;
  }

  fetch("/api/products")
    .then(res => res.json())
    .then(products => {

      let html = "";
      let total = 0;

      products.forEach(p => {
        if (cart[p.id]) {

          const qty = cart[p.id];
          const subtotal = p.price * qty;
          total += subtotal;

          html += `
            <div class="bg-white p-4 rounded-xl shadow mb-4 flex gap-4 items-center">

              <img src="${p.image}" class="w-24 h-24 object-cover rounded">

              <div class="flex-1">
                <h3 class="font-bold">${p.name}</h3>
                <p>NT$${p.price}</p>

                <div class="flex items-center gap-2 mt-2">
                  <button onclick="decrease('${p.id}')" class="px-3 py-1 bg-gray-200 rounded">-</button>
                  <span>${qty}</span>
                  <button onclick="increase('${p.id}')" class="px-3 py-1 bg-gray-200 rounded">+</button>
                </div>

                <p class="mt-2 font-bold">小計：NT$${subtotal}</p>
              </div>

              <button onclick="removeItem('${p.id}')" class="text-red-500">刪除</button>

            </div>
          `;
        }
      });

      html += `
        <div class="text-xl font-bold mt-6">
          總金額：NT$${total}
        </div>
      `;

      container.innerHTML = html;

    });
}


// ⭐ 功能區
window.increase = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[id] = (cart[id] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

window.decrease = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  if (cart[id]) {
    cart[id] -= 1;
    if (cart[id] <= 0) delete cart[id];
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

window.removeItem = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  delete cart[id];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};