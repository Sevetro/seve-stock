import fs from 'fs';
import path from 'path';
import { WebContents } from 'electron';

import { dataCacheDirname } from './constants.js';
import { YahooFinanceType } from '../main.js';
import { printAndSendError, printAndSendLog } from '../utils/message.js';
import { StockQuoteCache } from './types.js';
import { timestampParser } from './utils.js';
import { getErrorMsg, isError } from '../utils/error.js';
import { logs } from '../shared-with-ui/logs.js';
import { differenceInMinutes } from 'date-fns';
import { staleQuoteMinutes } from './config.js';
import { errors } from '../shared-with-ui/errors.js';

const stockQuotesCachePath = path.join(dataCacheDirname, 'stock-quotes');

async function fetchCurrentPrice(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  try {
    const price: number = (await yahooFinance.quote(`${symbol}.WA`, { fields: ['regularMarketPrice'] })).regularMarketPrice;
    const today = new Date();
    const stockQuote = {
      timestamp: today,
      price
    };

    fs.mkdirSync(stockQuotesCachePath, { recursive: true });
    const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(stockQuote, null, 2));

    return price;
  } catch (err) {
    printAndSendError(webContents, fetchCurrentPrice.name, err);
  }
}

export async function getCurrentPrice(symbol: string, yahooFinance: YahooFinanceType, webContents: WebContents) {
  const filePath = path.join(stockQuotesCachePath, `${symbol}.json`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: StockQuoteCache = JSON.parse(rawData, timestampParser);
    const { timestamp, price } = parsedData;

    if (price === undefined || price === 0) throw new Error(logs.invalidQuotePrice(symbol));

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);

    if (minutesSinceUpdate >= staleQuoteMinutes) {
      printAndSendLog(webContents, getCurrentPrice.name, logs.staleQuote(symbol));
      const freshPrice = await fetchCurrentPrice(symbol, yahooFinance, webContents);

      if (freshPrice == null || freshPrice === 0) {
        printAndSendLog(webContents, getCurrentPrice.name, errors.freshQuoteUnavailable(symbol));
        return price;
      } else {
        return freshPrice;
      }

    } else {
      return price;
    }
  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getCurrentPrice.name, logs.quoteCacheNotFound(symbol));
      return await fetchCurrentPrice(symbol, yahooFinance, webContents);
    }
    else if (getErrorMsg(err) === logs.invalidQuotePrice(symbol)) {
      printAndSendLog(webContents, getCurrentPrice.name, logs.invalidQuotePrice(symbol));
      return await fetchCurrentPrice(symbol, yahooFinance, webContents);
    }
    else {
      printAndSendError(webContents, getCurrentPrice.name, err);
    }
  }

}