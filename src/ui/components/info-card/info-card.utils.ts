export function getAvgPrice(stockData: CompanyStockData | undefined) {
  if (stockData === undefined || stockData.length === 0) return;
  return Number((stockData.reduce((acc, { avg }) => acc + avg, 0) / stockData.length).toFixed(2));
}

export function currentPriceToAvg(curr: number | undefined, avg: number | undefined) {
  if (curr === undefined || curr === 0 || avg === undefined || avg === 0) return;
  return curr / avg;
}

export function getPercentage(value: number | undefined, precision = 0) {
  if (value === undefined) return;
  return `${(value * 100).toFixed(precision)}%`;
}