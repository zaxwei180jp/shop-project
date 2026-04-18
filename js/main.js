fetch("/api/products")
  .then(res => res.json())
  .then(data => {

    const list = document.getElementById("product-list");
    list.innerHTML = "";

    data.forEach(p => {
      list.innerHTML += `
        <div class="bg-white p-4 rounded-2xl shadow">
          <img src="${p.image}" class="rounded-xl mb-3">
          <h3 class="font-bold">${p.name}</h3>
          <p class="text-gray-500">NT$${p.price}</p>
          <button onclick="addToCart('${p.id}')"
            class="mt-3 bg-black text-white px-4 py-2 rounded-xl">
            加入購物車
          </button>
        </div>
      `;
    });

  });

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  cart[id] = (cart[id] || 0) + 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("加入成功！");
}