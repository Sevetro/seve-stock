export const errors = {
  unknownError: 'Unknown error occured.',
  cantScrap: 'Could not scrap any companies.',
  companiesListCacheEmpty: 'Companies list cache file is empty, trying to scrap...',
  usingStaleCompaniesList: 'Unable to scrap fresh companies, using stale data from cache.',
  emptyStockDataResponse: (ticker: string) => `Empty response when fetching ${ticker}.`,
  exceededDailyHitsLimit: (ticker: string) => `Exceeded the daily hits limit when fetching ${ticker}.`,
  noAvailableStockData: (ticker: string) => `No available data for ${ticker}.`,
  freshStockDataUnavailable: (ticker: string) => `Fresh stock data for ${ticker} unavailable, using stale data from cache.`,
  getAvgPriceStockDataUndefined: (ticker: string) => `Stock data for ${ticker} is undefined.`,
  getAvgPriceStockDataEmpty: (ticker: string) => `Stock data for ${ticker} is empty.`
} as const; 