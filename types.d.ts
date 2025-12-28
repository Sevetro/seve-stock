interface Window {
  electron: {
    getTickers: EventFunction<'getTickers'>
    getCompanyStockData: EventFunction<'getCompanyStockData'>
    getQuote: EventFunction<'getQuote'>
    getTtmFinancialData: EventFunction<'getTtmFinancialData'>
    getCheapStocks: EventFunction<'getCheapStocks'>
    getBestDividends: EventFunction<'getBestDividends'>

    subscribeToMessages: EventSubscription<'message'>
  };
}

interface EventMap {
  getTickers: { args: [], payload: Promise<Tickers | undefined> }
  getCompanyStockData: { args: [symbol: string, stooqStartDate: string], payload: Promise<CompanyStockData | undefined> }
  getQuote: { args: [symbol: string], payload: Promise<Quote | undefined> }
  getTtmFinancialData: { args: [symbol: string], payload: Promise<TtmFinancialData | undefined> }
  getCheapStocks: { args: [stooqStartDate: string, count: number], payload: Promise<CheapStocks | undefined> }
  getBestDividends: { args: [count: number], payload: Promise<BestDividends | undefined> }

  message: { args: [], payload: Message }
}

type EventFunction<Key extends keyof EventMap> =
  (...args: EventMap[Key]['args']) => EventMap[Key]['payload']

type UnsubscribeFn = () => void;
type EventSubscription<Key extends keyof EventMap> =
  (callback: (payload: EventMap[Key]['payload']) => void) => UnsubscribeFn;

interface Message {
  type: 'log' | 'error'
  source: string
  msg: string
  details?: {
    symbol?: string
  }
}

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

interface Quote {
  price: number
  priceToBook: number
  marketCap: number
  bookValue: number
  dividend?: number
  fiveYearAvgDividend?: number
  priceToEarnings?: number
}

interface RawTtmFinancialData {
  totalRevenue: number
  grossProfit: number
  operatingIncome: number
  EBITDA: number
  EBIT: number
  netIncome: number
}

interface TtmFinancialData extends RawTtmFinancialData {
  grossProfitMargin: number
  operatingMargin: number
  ebitMargin: number
  netIncomeMargin: number
}

interface CheapStock extends Ticker {
  discount: number
}
type CheapStocks = CheapStock[]

interface BestDividend extends Ticker {
  dividend: number
}
type BestDividends = BestDividend[]