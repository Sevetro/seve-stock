export const errors = {
  unknownError: 'Unknown error occured.',
  cantGetWig140: 'The list of WIG140 tickers is invalid',
  usingStaleTickers: 'Unable to scrap fresh tickers, using stale data from cache.',
  noHistoricData: (symbol: string) => `No available historic data for ${symbol}`,
  freshHistoricDataUnavailable: (symbol: string) => `Fresh stock data for ${symbol} unavailable, using stale data from cache.`,
  cantGetHistoricData: (symbol: string) => `Can't get ${symbol} historic data.`,
  noAvailableTickers: 'No available tickers',
  cantGetYahooQuotes: 'Couldn\'t fetch every quote from Yahoo.',
  cantFetchQuote: (symbol: string) => `Couldn't fetch ${symbol} quote.`,
  invalidQuote: (symbol: string) => `${symbol} quote is invalid.`,
  freshQuoteUnavailable: (symbol: string) => `Fresh ${symbol} quote unavailable, using stale data from cache.`,
  cantGetCurrentPrice: (symbol: string) => `Couldn't get ${symbol} current price.`,
  cantGetAvgPrice: (symbol: string) => `Couldn't get ${symbol} average price.`,
  cantGetTickers: 'Couldn\'t get any tickers.',
  cantFetchTtmFinancialData: (symbol: string) => `Couldn't fetch TTM financial data for ${symbol}`,
  notEnoughFinancialQuarters: (symbol: string) => `Couldn't fetch enough financial quarters for ${symbol}`,
  freshTtmFinancialDataUnavailable: (symbol: string) => `Fresh ${symbol} financial data unavailable, using stale data from cache.`,
  cantGetCombinedInfo: (symbol: string) => `Couldn't get combined info for ${symbol}`,
  freshDividendUnavailable: (symbol: string) => `Fresh ${symbol} dividend data unavailable, using stale data from cache.`
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