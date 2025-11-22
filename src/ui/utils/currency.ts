export function formatPrice(price: number | undefined) {
  if (price === undefined) return;
  return price.toFixed(2);
}