export const logs = {
  companiesListCacheMissing: 'No companies list cache file found, trying to scrap...',
  companiesListStale: 'Companies list is stale, trying to scrap...',
  emptyTickerCache: 'cache file is empty, trying to fetch...',
  tickerCacheNotFound: 'cache file not found, trying to fetch...',
  stockDataStale: 'stock data is stale, trying to fetch...'
} as const; 