export interface HistoricDataCache {
  timestamp: Date
  historicData: HistoricData
}

export interface TickersCache {
  timestamp: Date
  tickers: Tickers
}

export interface StockQuoteCache extends Quote {
  timestamp: Date
}

export interface TtmFinancialDataCache extends TtmFinancialData {
  timestamp: Date
}

export interface DividendCache {
  timestamp: Date
  dividend: Dividend
}