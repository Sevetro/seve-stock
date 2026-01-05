interface Window {
  electron: {
    getTickers: EventFunction<'getTickers'>
    getCompanyStockData: EventFunction<'getCompanyStockData'>
    getCombinedInfo: EventFunction<'getCombinedInfo'>
    getCheapStocks: EventFunction<'getCheapStocks'>
    getBestDividends: EventFunction<'getBestDividends'>
    getAdvancedFiltersResult: EventFunction<'getAdvancedFiltersResult'>

    subscribeToMessages: EventSubscription<'message'>
  };
}

interface EventMap {
  getTickers: {
    args: [],
    payload: Promise<Tickers | undefined>
  }
  getCompanyStockData: {
    args: [symbol: string, stooqStartDate: string],
    payload: Promise<CompanyStockData | undefined>
  }
  getCombinedInfo: {
    args: [symbol: string, stooqStartDate: string],
    payload: Promise<CombinedInfo | undefined>
  }
  getCheapStocks: {
    args: [stooqStartDate: string, count: number],
    payload: Promise<CheapStocks | undefined>
  }
  getBestDividends: {
    args: [count: number],
    payload: Promise<BestDividends | undefined>
  }
  getAdvancedFiltersResult: {
    args: [advancedFilters: Partial<AdvancedFilters>, stooqStartDate: string],
    payload: Promise<Tickers | undefined>
  }

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
  priceToEarnings: number
}

type Dividend = number | undefined

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

interface CombinedInfo extends Quote, TtmFinancialData {
  dividend: Dividend
  priceChange: number
}

interface CheapStock extends Ticker {
  discount: number
}
type CheapStocks = CheapStock[]

interface BestDividend extends Ticker {
  dividend: number
}
type BestDividends = BestDividend[]

type AdvancedFiltersKey = 'dividend' | 'marketCap' | 'bookValue' | 'priceToEarnings' | 'priceToBook' | 'priceChange'

interface MinMax {
  min: number | undefined
  max: number | undefined
}

type AdvancedFilters = Record<AdvancedFiltersKey, MinMax>