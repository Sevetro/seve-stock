export interface StockRecordCache {
  timestamp: Date
  stockData: CompanyStockData
}

export interface TickersCache {
  timestamp: Date
  tickers: Tickers
}

interface CompanyWithStockData {
  company: string
  fullname: string
  stockData: CompanyStockData
}
export type PreparedData = Record<string, CompanyWithStockData>

export interface StockQuoteCache extends Quote {
  timestamp: Date
}

export interface FinancialData {
  totalRevenue: number
  operatingRevenue: number
  totalExpenses: number
  costOfRevenue: number
  grossProfit: number
  operatingExpense: number
  operatingIncome: number
  EBITDA: number
  EBIT: number
  netIncome: number
}

export interface ExtendedFinancialData extends FinancialData {
  operatingMargin: number
}
