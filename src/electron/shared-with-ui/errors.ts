export const errors = {
  unknownError: 'Unknown error occured.',
  cantScrap: 'Could not scrap any companies.',
  companiesListCacheEmpty: 'Companies list cache file is empty, trying to scrap...',
  usingStaleCompaniesList: 'Unable to scrap fresh companies, using stale data from cache.',
  emptyStockDataResponse: 'Empty response for',
  exceededDailyHitsLimit: 'Exceeded the daily hits limit when fetching',
  noAvailableStockData: 'No available data for',
  freshStockDataUnavailable: 'fresh stock data unavailable, using stale data from cache'
} as const; 