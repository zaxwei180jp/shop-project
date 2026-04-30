const API_URL = "https://shop-project-azure.vercel.app/api/products";

const el = document.getElementById("list");

async function init() {
  el.innerHTML = "Loading...";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    el.innerHTML = data.map(p => `
      <a href="product.html?id=${p.id}" class="block border p-2 hover:shadow">
        <img src="${p.image || 'https://picsum.photos/400'}"
             class="w-full h-40 object-cover">

        <div class="mt-2 font-bold">${p.name}</div>
        <div class="text-red-500">¥${p.price}</div>
      </a>
    `).join("");

  } catch (err) {
    console.error(err);
    el.innerHTML = "載入失敗";
  }
}

init();