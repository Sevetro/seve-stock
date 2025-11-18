export const logs = {
  companiesListCacheMissing: 'No companies list cache file found, trying to scrap...',
  companiesListStale: 'Companies list is stale, trying to scrap...',
  emptyTickerCache: (ticker: string) => `Cache file for ${ticker} is empty, trying to fetch...`,
  tickerCacheNotFound: (ticker: string) => `Cache file for ${ticker} not found, trying to fetch...`,
  stockDataStale: (ticker: string) => `Stock data for ${ticker} is stale, trying to fetch...`,
  earliestAvailableData: (ticker: string, earliestAvailableData: string) => `Earliest available data for ${ticker} is ${earliestAvailableData}.`
} as const; 