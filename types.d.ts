interface Window {
  electron: {
    getTickers: EventFunction<'getTickers'>
    getHistoricData: EventFunction<'getHistoricData'>
    getCombinedInfo: EventFunction<'getCombinedInfo'>
    getCheapStocks: EventFunction<'getCheapStocks'>
    getBestDividends: EventFunction<'getBestDividends'>
    getBiggestGaps: EventFunction<'getBiggestGaps'>
    getAdvancedFiltersResult: EventFunction<'getAdvancedFiltersResult'>

    subscribeToMessages: EventSubscription<'message'>
  };
}

interface EventMap {
  getTickers: {
    args: [],
    payload: Promise<Tickers | undefined>
  }
  getHistoricData: {
    args: [symbol: string, startDate: Date],
    payload: Promise<HistoricData | undefined>
  }
  getCombinedInfo: {
    args: [symbol: string, startDate: Date],
    payload: Promise<CombinedInfo | undefined>
  }
  getCheapStocks: {
    args: [startDate: Date, count: number],
    payload: Promise<CheapStocks | undefined>
  }
  getBestDividends: {
    args: [count: number],
    payload: Promise<BestDividends | undefined>
  }
  getBiggestGaps: {
    args: [startDate: Date, count: number],
    payload: Promise<BiggestGaps | undefined>
  }
  getAdvancedFiltersResult: {
    args: [advancedFilters: Partial<AdvancedFilters>, startDate: Date],
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

interface HistoricDataRecord {
  date: Date;
  open: number
  high: number
  low: number
  close: number
  avg: number
}
type HistoricData = HistoricDataRecord[]

interface Quote {
  price: number
  priceToBook: number
  marketCap: number
  bookValue: number
  priceToEarnings: number
  dividend: number
}

interface PrevYearDividendData {
  prevYearDividendValue: number
  prevYearDividendToCurrPrice: number
  prevYearDividendToAvgPrice: number
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

interface CombinedInfo extends Quote, TtmFinancialData {
  dividend: Dividend
  priceChange: number
  priceGap: number
}

interface CheapStock extends Ticker {
  discount: number
}
type CheapStocks = CheapStock[]

interface BestDividend extends Ticker {
  dividend: number
}
type BestDividends = BestDividend[]

interface BiggestGap extends Ticker {
  gap: number
}
type BiggestGaps = BiggestGap[]

type AdvancedFiltersKey = 'dividend' | 'marketCap' | 'bookValue' | 'priceToEarnings' | 'priceToBook' | 'priceChange'

interface MinMax {
  min: number | undefined
  max: number | undefined
}

type AdvancedFilters = Record<AdvancedFiltersKey, MinMax>