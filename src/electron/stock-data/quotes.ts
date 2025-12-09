import fs from 'fs';
import path from 'path';
import { WebContents } from 'electron';
import { Quote } from 'yahoo-finance2/modules/quote';

import { dataCacheDirname } from './constants.js';
import { YahooFinanceType } from '../main.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { StockQuoteCache } from './types.js';
import { getBiggerNumber, timestampParser } from './utils.js';
import { logs } from '../shared-with-ui/logs.js';
import { differenceInMinutes } from 'date-fns';
import { staleQuoteMinutes } from './config.js';
import { errors, getErrorMsg, isError } from '../shared-with-ui/errors.js';

const stockQuotesCachePath = path.join(dataCacheDirname, 'stock-quotes');

async function fetchQuote(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  try {
    const quote = await yahooFinance.quote(`${symbol}.WA`, { fields: ['regularMarketPrice', 'dividendYield', 'trailingAnnualDividendYield'] }) as Quote | undefined;
    if (quote == null) throw new Error(errors.cantFetchQuote(symbol));
    const { regularMarketPrice: price, dividendYield, trailingAnnualDividendYield } = quote;

    const now = new Date();
    const stockQuote = {
      timestamp: now,
      price,
      dividendYield,
      trailingAnnualDividendYield: trailingAnnualDividendYield * 100
    };

    fs.mkdirSync(stockQuotesCachePath, { recursive: true });
    const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(stockQuote, null, 2));

    return { price, dividendYield, trailingAnnualDividendYield: trailingAnnualDividendYield * 100 };
  } catch (err) {
    printAndSendError(webContents, fetchQuote.name, err);
  }
}

export async function getCurrentPrice(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: StockQuoteCache = JSON.parse(rawData, timestampParser);
    const { timestamp, price } = parsedData;
    if (price == null || price === 0) throw new Error(errors.invalidQuotePrice(symbol));

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);
    if (minutesSinceUpdate >= staleQuoteMinutes) {
      printAndSendLog(webContents, getCurrentPrice.name, logs.staleQuote(symbol));

      const freshQuote = await fetchQuote(symbol, yahooFinance, webContents);
      if (freshQuote?.price == null || freshQuote.price === 0) {
        printAndSendMsg(webContents, { msg: errors.freshQuoteUnavailable(symbol), source: getCurrentPrice.name, type: 'error' });
        return price;
      } else {
        return freshQuote.price;
      }

    } else {
      return price;
    }
  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getCurrentPrice.name, logs.quoteCacheNotFound(symbol));
      return (await fetchQuote(symbol, yahooFinance, webContents))?.price;
    }
    else if (getErrorMsg(err) === errors.invalidQuotePrice(symbol)) {
      printAndSendError(webContents, getCurrentPrice.name, err);
      return (await fetchQuote(symbol, yahooFinance, webContents))?.price;
    }
    else {
      printAndSendError(webContents, getCurrentPrice.name, err);
    }
  }
}

// Name of function used in error detection
export async function getDividendYield(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: StockQuoteCache = JSON.parse(rawData, timestampParser);
    const { timestamp, dividendYield, trailingAnnualDividendYield } = parsedData;
    if ((dividendYield == null || dividendYield === 0) && (trailingAnnualDividendYield == null || trailingAnnualDividendYield === 0)) throw new Error(logs.noDividendInCache(symbol));

    const biggerDividendValue = getBiggerNumber(dividendYield, trailingAnnualDividendYield);

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);
    if (minutesSinceUpdate >= staleQuoteMinutes) {
      printAndSendLog(webContents, getDividendYield.name, logs.staleQuote(symbol));

      const freshQuote = await fetchQuote(symbol, yahooFinance, webContents);
      if ((freshQuote?.dividendYield == null || freshQuote.dividendYield === 0) && (freshQuote?.trailingAnnualDividendYield == null || freshQuote?.trailingAnnualDividendYield === 0)) {
        printAndSendMsg(webContents, { msg: errors.freshQuoteUnavailable(symbol), source: getDividendYield.name, type: 'error', details: { symbol } });
        return biggerDividendValue;
      } else {
        return getBiggerNumber(freshQuote.dividendYield, freshQuote.trailingAnnualDividendYield);
      }

    } else {
      return biggerDividendValue;
    }
  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getDividendYield.name, logs.quoteCacheNotFound(symbol));
      const freshQuote = await fetchQuote(symbol, yahooFinance, webContents);
      return getBiggerNumber(freshQuote?.dividendYield, freshQuote?.trailingAnnualDividendYield);
    }
    else if (getErrorMsg(err) === logs.noDividendInCache(symbol)) {
      printAndSendLog(webContents, getDividendYield.name, logs.noDividendInCache(symbol));
      const freshQuote = await fetchQuote(symbol, yahooFinance, webContents);
      return getBiggerNumber(freshQuote?.dividendYield, freshQuote?.trailingAnnualDividendYield);
    }
    else {
      printAndSendError(webContents, getDividendYield.name, err);
    }
  }
}