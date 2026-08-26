export const logs = {
  tickersCacheMissing: 'No tickers cache file found, trying to scrap...',
  historicCacheNotFound: (symbol: string) => `Historic data cache for ${symbol} not found, trying to fetch...`,
  stockDataStale: (symbol: string) => `Stock data for ${symbol} is stale, trying to fetch...`,
  earliestAvailableData: (symbol: string, earliestAvailableData: string) => `Earliest available data for ${symbol} is ${earliestAvailableData}.`,
  quoteCacheNotFound: (symbol: string) => `Couldn't find quote cache for ${symbol}.`,
  staleTtmFinancialData: (symbol: string) => `${symbol} financial data is stale, trying to fetch...`,
  ttmFinancialDataCacheNotFound: (symbol: string) => `Couldn't find financial data cache for ${symbol}, trying to fetch...`,
  partialTtmFinancialData: (symbol: string, fields: string[]) => `${symbol} has no TTM ${fields.join(', ')}; using available financial metrics.`,
  dividendCacheNotFound: (symbol: string) => `Couldn't find dividend data cache for ${symbol}, trying to fetch...`,
  skippedInvalidHistoricRecords: (symbol: string, count: number) => `Skipped ${count} corrupted historic record(s) for ${symbol}.`
} as const; 