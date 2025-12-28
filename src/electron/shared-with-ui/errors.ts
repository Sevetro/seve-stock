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
  cantFetchQuote: (symbol: string) => `Couldn't fetch ${symbol} quote.`,
  invalidQuote: (symbol: string) => `${symbol} quote is invalid.`,
  freshQuoteUnavailable: (symbol: string) => `Fresh ${symbol} quote unavailable, using stale data from cache.`,
  cantGetCurrentPrice: (symbol: string) => `Couldn't get ${symbol} current price.`,
  cantGetAvgPrice: (symbol: string) => `Couldn't get ${symbol} average price.`,
  cantGetTickers: 'Couldn\'t get any tickers.',
  cantFetchTtmFinancialData: (symbol: string) => `Couldn't fetch TTM financial data for ${symbol}`,
  notEnoughFinancialQuarters: (symbol: string) => `Couldn't fetch enough financial quarters for ${symbol}`,
  freshTtmFinancialDataUnavailable: (symbol: string) => `Fresh ${symbol} financial data unavailable, using stale data from cache.`
} as const;

export function isError(err: unknown): err is Error {
  return err instanceof Error;
}
function isTypeError(err: unknown): err is TypeError {
  return err instanceof TypeError;
}

export function getErrorMsg(err: unknown) {
  if (isTypeError(err)) {
    return `${err.message} ${err.cause}`;
  } else if (isError(err)) {
    return err.message;
  } else {
    return errors.unknownError;
  }
}