const API_URL = "https://shop-project-azure.vercel.app/api/products";

const el = document.getElementById("list");

async function init() {
  el.innerHTML = "Loading...";

  const res = await fetch(API_URL);
  let data = await res.json();

  data.sort((a, b) =>
    new Date(b.createdTime) - new Date(a.createdTime)
  );

  el.innerHTML = data.map(p => {
    const img = p.image || p.images?.[0] || "https://via.placeholder.com/400";

    return `
      <a href="product.html?id=${p.id}" class="block border p-2">
        <img src="${img}" class="w-full h-40 object-cover">
        <div class="mt-2 font-bold">${p.name}</div>
        <div class="text-red-500">¥${p.price}</div>
      </a>
    `;
  }).join("");
}

init();