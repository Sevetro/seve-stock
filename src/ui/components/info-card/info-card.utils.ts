export function getPercentage(value: number | undefined, precision = 0) {
  if (value === undefined) return;
  return `${(value * 100).toFixed(precision)}%`;
}