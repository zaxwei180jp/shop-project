import { getCart, formatPrice } from "./utils.js";

const el = document.getElementById("cart");

async function init() {
  el.innerHTML = "Loading...";

  const cart = getCart();

  const res = await fetch("/api/products");
  const products = await res.json();

  let total = 0;

  const html = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      if (!p) return "";

      const subtotal = p.price * qty;
      total += subtotal;

      return `
        <div class="flex justify-between border-b py-2">
          <div>${p.name} x ${qty}</div>
          <div>${formatPrice(subtotal)}</div>
        </div>
      `;
    })
    .join("");

  el.innerHTML = `
    ${html || "購物車是空的"}
    <div class="text-right mt-4 font-bold">
      Total: ${formatPrice(total)}
    </div>
  `;
}

init();