import { formatPrice, addToCart } from "./utils.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");

const el = document.getElementById("product");

async function init() {
  el.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/products");
    const data = await res.json();

    const product = data.find((p) => p.id === id);

    if (!product) {
      el.innerHTML = "Product not found";
      return;
    }

    render(product);
  } catch (e) {
    el.innerHTML = "Error loading product";
  }
}

function render(p) {
  el.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <img id="mainImg" src="${p.image}" class="w-full rounded">
        <div class="flex gap-2 mt-2">
          ${p.images
            .map(
              (img) =>
                `<img src="${img}" class="w-16 h-16 object-cover cursor-pointer thumb">`
            )
            .join("")}
        </div>
      </div>

      <div>
        <h1 class="text-2xl font-bold">${p.name}</h1>
        <p class="text-xl text-red-500 mt-2">${formatPrice(p.price)}</p>

        <button id="addBtn"
          class="mt-4 px-4 py-2 bg-black text-white rounded">
          加入購物車
        </button>

        <p class="mt-4 text-gray-600">${p.description}</p>
      </div>
    </div>
  `;

  document.querySelectorAll(".thumb").forEach((img) => {
    img.onclick = () =>
      (document.getElementById("mainImg").src = img.src);
  });

  document.getElementById("addBtn").onclick = () => {
    addToCart(p.id);
    alert("已加入購物車");
  };
}

init();