export const logs = {
  tickersCacheMissing: 'No tickers cache file found, trying to scrap...',
  tickersStale: 'Tickers are stale, trying to scrap...',
  emptyTickerCache: (symbol: string) => `Cache file for ${symbol} is empty, trying to fetch...`,
  tickerCacheNotFound: (symbol: string) => `Cache file for ${symbol} not found, trying to fetch...`,
  stockDataStale: (symbol: string) => `Stock data for ${symbol} is stale, trying to fetch...`,
  earliestAvailableData: (symbol: string, earliestAvailableData: string) => `Earliest available data for ${symbol} is ${earliestAvailableData}.`,
  quoteCacheNotFound: (symbol: string) => `Couldn't find quote cache for ${symbol}.`,
  staleQuote: (symbol: string) => `${symbol} quote is stale, trying to fetch...`,
  staleTtmFinancialData: (symbol: string) => `${symbol} financial data is stale, trying to fetch...`,
  ttmFinancialDataCacheNotFound: (symbol: string) => `Couldn't find financial data cache for ${symbol}.`
} as const; 