export const errors = {
  unknownError: 'Unknown error occured.',
  cantScrap: 'Couldn\'t scrap any tickers.',
  tickersCacheEmpty: 'Tickers cache file is empty, trying to scrap...',
  usingStaleTickers: 'Unable to scrap fresh tickers, using stale data from cache.',
  responseNotOk: (status: number, symbol: string) => `HTTP ${status} for ${symbol}`,
  emptyStockDataResponse: (symbol: string) => `Empty response when fetching ${symbol}.`,
  exceededDailyHitsLimit: (symbol: string) => `Exceeded the daily hits limit when fetching ${symbol}.`,
  noAvailableStockData: (symbol: string) => `No available data for ${symbol}.`,
  freshStockDataUnavailable: (symbol: string) => `Fresh stock data for ${symbol} unavailable, using stale data from cache.`,
  getAvgPriceStockDataUndefined: (symbol: string) => `Stock data for ${symbol} is undefined.`,
  getAvgPriceStockDataEmpty: (symbol: string) => `Stock data for ${symbol} is empty.`,
  noAvailableTickers: 'No available tickers',
  cantGetYahooQuotes: 'Couldn\'t fetch quotes from Yahoo.',
  freshQuoteUnavailable: (symbol: string) => `Fresh ${symbol} quote unavailable, using stale quote from cache.`,
  currentPriceUndefined: (symbol: string) => `Current ${symbol} price is undefined.`,
  avgPriceUndefined: (symbol: string) => `Average ${symbol} price is undefined.`
} as const; 