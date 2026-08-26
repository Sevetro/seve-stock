import fs from 'fs';
import path from 'path';
import { WebContents } from 'electron';
import { QuoteEquity } from 'yahoo-finance2/modules/quote';

import { dataCacheDirname } from './constants.js';
import { YahooFinanceType } from '../main.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { StockQuoteCache } from './types.js';
import { timestampParser } from './utils.js';
import { logs } from '../shared-with-ui/logs.js';
import { differenceInMinutes } from 'date-fns';
import { staleQuoteMinutes } from './config.js';
import { errors, isError } from '../shared-with-ui/errors.js';

const stockQuotesCachePath = path.join(dataCacheDirname, 'stock-quotes');

async function fetchQuote(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  try {
    const quoteAllInfo = await yahooFinance.quote(`${symbol}.WA`, {
      fields: ['regularMarketPrice', 'priceToBook', 'marketCap', 'trailingPE', 'epsTrailingTwelveMonths',
        'dividendYield', 'trailingAnnualDividendYield'
      ]
    }) as QuoteEquity | undefined;

    if (quoteAllInfo === undefined) throw new Error(errors.cantFetchQuote(symbol));

    const {
      regularMarketPrice, priceToBook, marketCap, trailingPE, epsTrailingTwelveMonths,
      dividendYield, trailingAnnualDividendYield
    } = quoteAllInfo;

    if (regularMarketPrice === undefined || !priceToBook) throw new Error(errors.invalidQuote(symbol));

    const bookValue = marketCap == null ? 0 : marketCap / priceToBook;

    let priceToEarnings = 0;
    if (trailingPE != null) priceToEarnings = trailingPE;
    if (trailingPE == null && epsTrailingTwelveMonths) priceToEarnings = regularMarketPrice / epsTrailingTwelveMonths;

    function calcDividend() {
      if (dividendYield != null && dividendYield !== 0 &&
        trailingAnnualDividendYield != null && trailingAnnualDividendYield !== 0
      ) return (dividendYield + trailingAnnualDividendYield * 100) / 2;

      if (dividendYield != null && dividendYield !== 0) return dividendYield;
      if (trailingAnnualDividendYield != null && trailingAnnualDividendYield !== 0) return trailingAnnualDividendYield * 100;
      return 0;
    }
    const dividend = Number(calcDividend().toFixed(1));

    const quote: Quote = {
      price: regularMarketPrice,
      marketCap: marketCap ?? 0,
      bookValue,
      priceToBook,
      priceToEarnings,
      dividend
    };
    const quoteWithTimestamp: StockQuoteCache = {
      timestamp: new Date(),
      ...quote
    };

    fs.mkdirSync(stockQuotesCachePath, { recursive: true });
    const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(quoteWithTimestamp, null, 2));

    return quote;
  } catch (err) {
    printAndSendError(webContents, fetchQuote.name, err);
  }
}

export async function getQuote(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: StockQuoteCache = JSON.parse(rawData, timestampParser);
    const { timestamp, ...quote } = parsedData;

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);
    if (minutesSinceUpdate >= staleQuoteMinutes) {
      const freshQuote = await fetchQuote(symbol, yahooFinance, webContents);
      if (freshQuote === undefined) {
        printAndSendMsg(webContents, {
          msg: errors.freshQuoteUnavailable(symbol),
          source: getQuote.name,
          type: 'error',
          details: { symbol }
        });
        return quote;

      } else return freshQuote;

    } else return quote;

  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getQuote.name, logs.quoteCacheNotFound(symbol));
      return await fetchQuote(symbol, yahooFinance, webContents);
    } else {
      printAndSendError(webContents, getQuote.name, err);
    }
  }
}