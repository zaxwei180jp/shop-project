export const formatPrice = (n) => {
  const currency = localStorage.getItem('w82_currency') || 'TWD';
  const config = currency === 'JPY' 
    ? { locale: 'ja-JP', currency: 'JPY' }
    : { locale: 'zh-TW', currency: 'TWD' };
  
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(Number(n || 0)));
};

export const getCart = () =>
  JSON.parse(localStorage.getItem("cart") || "{}");

export const saveCart = (cart) =>
  localStorage.setItem("cart", JSON.stringify(cart));

export const getTotalQty = () => {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
};
