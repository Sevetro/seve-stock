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

export interface TtmFinancialDataCache extends TtmFinancialData {
  timestamp: Date
}