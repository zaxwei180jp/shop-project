// 💰 價格（新台幣）
export const formatPrice = (n) => {
  if (n == null) return "NT$0";
  return `NT$${Number(n).toLocaleString()}`;
};

// 🛒 取得購物車
export const getCart = () =>
  JSON.parse(localStorage.getItem("cart") || "{}");

// 💾 儲存購物車
export const saveCart = (cart) =>
  localStorage.setItem("cart", JSON.stringify(cart));

// ➕ 加入購物車
export const addToCart = (id, qty = 1) => {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
};

// 🔢 總數量
export const getTotalQty = () => {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
};