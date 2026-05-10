const API_URL = "/api/products";
const CACHE_TIME = 1000 * 60 * 10;

export const formatPrice = (n) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
  }).format(n);

export async function getProducts() {
  try {
    const cache = localStorage.getItem("products");
    const time = localStorage.getItem("products_time");

    if (cache && time && Date.now() - time < CACHE_TIME) {
      return JSON.parse(cache);
    }

    const res = await fetch(API_URL);
    const data = await res.json();

    localStorage.setItem("products", JSON.stringify(data));
    localStorage.setItem("products_time", Date.now());

    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/* CART */
export const getCart = () =>
  JSON.parse(localStorage.getItem("cart") || "{}");

export const saveCart = (cart) =>
  localStorage.setItem("cart", JSON.stringify(cart));

export function addToCart(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  updateCartCount();
}

export function updateQty(id, delta) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(cart);
}

export function removeItem(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem("cart");
}

/* UI */
export function updateCartCount() {
  const cart = getCart();
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = total;
}