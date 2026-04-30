const API_URL = "https://shop-project-azure.vercel.app/api/products";

const el = document.getElementById("list");

async function init() {
  el.innerHTML = "Loading...";

  const res = await fetch(API_URL);
  const data = await res.json();

  el.innerHTML = data.map(p => {
    const img = p.image || p.images?.[0] || "https://via.placeholder.com/400";

    return `
      <a href="product.html?id=${p.id}" class="block border p-2 hover:shadow">
        <img src="${img}" class="w-full aspect-square object-cover">

        <div class="mt-2 font-bold">${p.name}</div>

        ${p.isSale
          ? `<div class="text-red-500">
               ¥${p.price}
               <span class="line-through text-gray-400 text-sm">¥${p.originalPrice}</span>
             </div>`
          : `<div class="text-red-500">¥${p.price}</div>`
        }
      </a>
    `;
  }).join("");
}

init();