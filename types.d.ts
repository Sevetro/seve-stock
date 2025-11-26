interface Window {
  electron: {
    getTickers: EventFunction<'getTickers'>
    getCompanyStockData: EventFunction<'getCompanyStockData'>
    getCurrentPrice: EventFunction<'getCurrentPrice'>
    getCheapStocks: EventFunction<'getCheapStocks'>

    subscribeToMessages: EventSubscription<'message'>
  };
}

interface EventMap {
  getTickers: { args: [], payload: Promise<Tickers | undefined> }
  getCompanyStockData: { args: [symbol: string, stooqStartDate: string], payload: Promise<CompanyStockData | undefined> }
  getCurrentPrice: { args: [symbol: string], payload: Promise<number | undefined> }
  getCheapStocks: { args: [stooqStartDate: string, count: number], payload: Promise<CheapStocks | undefined> }

  message: { args: [], payload: Message }
}

type EventFunction<Key extends keyof EventMap> =
  (...args: EventMap[Key]['args']) => EventMap[Key]['payload']

type UnsubscribeFn = () => void;
type EventSubscription<Key extends keyof EventMap> =
  (callback: (payload: EventMap[Key]['payload']) => void) => UnsubscribeFn;

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
  details?: {
    symbol?: string
  }
}

interface CheapStock extends Ticker {
  discount: number
}
type CheapStocks = CheapStock[]