import type { CandlestickData } from 'lightweight-charts';

export function createCandlestickData(companyStockData: CompanyStockData): CandlestickData[] {
  return companyStockData.map(({ date, open, high, low, close }) => ({
    time: date,
    open,
    high,
    low,
    close
  }));
}