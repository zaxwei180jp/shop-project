import { formatPrice } from "./utils.js";

const el = document.getElementById("list");

async function init() {
  el.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/products");
    let data = await res.json();

    data.sort(
      (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
    );

    el.innerHTML = data
      .map(
        (p) => `
      <a href="/product.html?id=${p.id}" class="block border p-2">
        <img src="${p.image}" class="w-full h-40 object-cover">
        <div>${p.name}</div>
        <div class="text-red-500">${formatPrice(p.price)}</div>
      </a>
    `
      )
      .join("");
  } catch {
    el.innerHTML = "Error loading products";
  }
}

init();