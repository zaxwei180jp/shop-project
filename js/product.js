const API_URL = "https://shop-project-azure.vercel.app/api/products";

const params = new URLSearchParams(location.search);
const id = params.get("id");

const el = document.getElementById("product");

async function init() {
  el.innerHTML = "Loading...";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const p = data.find(x => x.id === id);

    if (!p) {
      el.innerHTML = "找不到商品";
      return;
    }

    render(p);

  } catch (err) {
    console.error(err);
    el.innerHTML = "載入失敗";
  }
}

function render(p) {
  const mainImage = p.image || p.images[0] || "https://picsum.photos/400";

  el.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      
      <div>
        <img id="mainImg" src="${mainImage}" class="w-full rounded">

        <div class="flex gap-2 mt-2">
          ${p.images.map(img => `
            <img src="${img}"
                 class="w-16 h-16 object-cover cursor-pointer thumb">
          `).join("")}
        </div>
      </div>

      <div>
        <h1 class="text-2xl font-bold">${p.name}</h1>
        <p class="text-xl text-red-500 mt-2">¥${p.price}</p>

        <button id="addBtn"
          class="mt-4 px-4 py-2 bg-black text-white rounded">
          加入購物車
        </button>

        <p class="mt-4 text-gray-600">${p.description || ""}</p>
      </div>

    </div>
  `;

  document.querySelectorAll(".thumb").forEach(img => {
    img.onclick = () => {
      document.getElementById("mainImg").src = img.src;
    };
  });

  document.getElementById("addBtn").onclick = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    cart[p.id] = (cart[p.id] || 0) + 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("已加入購物車");
  };
}

init();