document.addEventListener("DOMContentLoaded", () => {

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
            <div class="bg-white p-4 rounded-xl shadow mb-4 flex gap-4">
              <img src="${p.image}" class="w-24 h-24 object-cover rounded">
              <div>
                <h3 class="font-bold">${p.name}</h3>
                <p>單價：NT$${p.price}</p>
                <p>數量：${qty}</p>
                <p class="font-bold">小計：NT$${subtotal}</p>
              </div>
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

});