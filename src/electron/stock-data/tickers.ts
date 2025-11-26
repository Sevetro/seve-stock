import fs from 'fs';
import path from 'path';
import { differenceInDays } from 'date-fns';
import { WebContents } from 'electron';

import { dataCacheDirname } from './constants.js';
import { TickersCache } from './types.js';
import { timestampParser } from './utils.js';
import { staleTickersDays } from './config.js';
import { errors, getErrorMsg, isError } from '../shared-with-ui/errors.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { logs } from '../shared-with-ui/logs.js';
import { YahooFinanceType } from '../main.js';

const tickersCachePath = path.join(dataCacheDirname, 'tickers.json');
const tickerRegex = /data-rowkey="GPW:([A-Z]+)/g;
const pageToScrap = 'https://pl.tradingview.com/markets/stocks-poland/market-movers-large-cap/';

async function scrapTickers(webContents: WebContents, yahooFinance: YahooFinanceType) {
  try {
    const res = await fetch(pageToScrap);
    const html = await res.text();
    const matchedData = [...html.matchAll(tickerRegex)];

    if (matchedData.length === 0) throw new Error(errors.cantScrap);

    const symbols = matchedData.map(match => `${match[1]}.WA`);
    const tickers = (await yahooFinance.quote(symbols, { fields: ['shortName'] }))
      .map(({ symbol, shortName }) => ({ symbol: (symbol as string).slice(0, 3), name: shortName }));

    if (tickers.length === 0) throw new Error(errors.cantGetYahooQuotes);

    const today = new Date();
    const tickersWithTimestamp = {
      timestamp: today,
      tickers
    };

    fs.mkdirSync(dataCacheDirname, { recursive: true });
    fs.writeFileSync(tickersCachePath, JSON.stringify(tickersWithTimestamp, null, 2));

    return tickers;
  } catch (err) {
    printAndSendError(webContents, scrapTickers.name, err);
  }
}

export async function getTickers(webContents: WebContents, yahooFinance: YahooFinanceType) {
  try {
    const rawData = fs.readFileSync(tickersCachePath, 'utf-8');
    const parsedData: TickersCache = JSON.parse(rawData, timestampParser);
    const { timestamp, tickers } = parsedData;

    if (tickers.length === 0) throw new Error(errors.tickersCacheEmpty);

    const daysSinceUpdate = differenceInDays(new Date(), timestamp);

    if (daysSinceUpdate >= staleTickersDays) {
      printAndSendLog(webContents, getTickers.name, logs.tickersStale);
      const freshTickers = await scrapTickers(webContents, yahooFinance);

      if (freshTickers === undefined || freshTickers.length === 0) {
        printAndSendMsg(webContents, { msg: errors.usingStaleTickers, source: getTickers.name, type: 'error' });
        return tickers;
      } else {
        return freshTickers;
      }

    } else {
      return tickers;
    }
  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getTickers.name, logs.tickersCacheMissing);
      return await scrapTickers(webContents, yahooFinance);
    } else if (getErrorMsg(err) === errors.tickersCacheEmpty) {
      printAndSendError(webContents, getTickers.name, err);
      return await scrapTickers(webContents, yahooFinance);
    }
    else {
      printAndSendError(webContents, getTickers.name, err);
    }
  }
}