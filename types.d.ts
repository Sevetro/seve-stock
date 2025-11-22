interface Window {
  electron: {
    getTickers: () => Promise<Tickers | undefined>
    getCompanyStockData: (symbol: string, stooqStartDate: string) => Promise<CompanyStockData | undefined>
    getCurrentPrice: (symbol: string) => Promise<number | undefined>
    getDiscountList: (stooqStartDate: string, count: number) => Promise<StockDiscountList | undefined>

    subscribeToMessages: (callback: (msg: Message) => void) => UnsubscribeFn
  };
}

interface EventMap {
  getTickers: { args: [], payload: Promise<Tickers | undefined> }
  getCompanyStockData: { args: [symbol: string, stooqStartDate: string], payload: Promise<CompanyStockData | undefined> }
  getCurrentPrice: { args: [symbol: string], payload: Promise<number | undefined> }
  getDiscountList: { args: [stooqStartDate: string, count: number], payload: Promise<StockDiscountList | undefined> }

  message: { args: [], payload: Message }
}

type UnsubscribeFn = () => void;

interface Ticker {
  symbol: string
  name: string
}
type Tickers = Ticker[]

interface StockDataRecord {
  date: string;
  open: number
  high: number
  low: number
  close: number
  avg: number
}
type CompanyStockData = StockDataRecord[]

interface Message {
  type: 'log' | 'error'
  source: string
  msg: string
}

interface StockDiscount {
  symbol: string;
  discount: number;
}
type StockDiscountList = StockDiscount[]