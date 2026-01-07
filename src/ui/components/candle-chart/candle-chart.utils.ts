import type { CandlestickData } from 'lightweight-charts';

export function createCandlestickData(historicData: HistoricData): CandlestickData[] {
  return historicData.map(({ date, open, high, low, close }) => ({
    time: date.toISOString().slice(0, 10),
    open,
    high,
    low,
    close
  }));
}