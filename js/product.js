const API_URL = "https://shop-project-azure.vercel.app/api/products";

const id = new URLSearchParams(location.search).get("id");
const el = document.getElementById("product");

async function init() {
  el.innerHTML = "Loading...";

  const res = await fetch(API_URL);
  const data = await res.json();

  const p = data.find(x => x.id === id);

  const mainImg = p.image || p.images[0] || "https://via.placeholder.com/400";

  el.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <img id="mainImg" src="${mainImg}" class="w-full">

        <div class="flex gap-2 mt-2">
          ${p.images.map(img => `
            <img src="${img}" class="w-16 h-16 cursor-pointer thumb">
          `).join("")}
        </div>
      </div>

      <div>
        <h1 class="text-2xl font-bold">${p.name}</h1>
        <p class="text-red-500 mt-2">¥${p.price}</p>

        <button id="addBtn"
          class="mt-4 px-4 py-2 bg-black text-white">
          加入購物車
        </button>

        <p class="mt-4">${p.description || ""}</p>
      </div>
    </div>
  `;

  document.querySelectorAll(".thumb").forEach(img => {
    img.onclick = () =>
      document.getElementById("mainImg").src = img.src;
  });

  document.getElementById("addBtn").onclick = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    cart[p.id] = (cart[p.id] || 0) + 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("已加入購物車");
  };
}

init();