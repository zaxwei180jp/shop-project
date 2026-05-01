export const formatPrice = (n) => {
  const num = Number(n || 0);

  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(num);
};

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart") || "{}");
  } catch {
    return {};
  }
};

export const saveCart = (cart) =>
  localStorage.setItem("cart", JSON.stringify(cart));