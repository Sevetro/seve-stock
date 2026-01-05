import fs from 'fs';
import path from 'path';
import { differenceInDays } from 'date-fns';
import { WebContents } from 'electron';
import { load } from 'cheerio';

import { dataCacheDirname } from './constants.js';
import { TickersCache } from './types.js';
import { timestampParser } from './utils.js';
import { staleTickersDays } from './config.js';
import { errors, getErrorMsg, isError } from '../shared-with-ui/errors.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { logs } from '../shared-with-ui/logs.js';
import { YahooFinanceType } from '../main.js';

const tickersCachePath = path.join(dataCacheDirname, 'tickers.json');
const pageWig140 = 'https://www.biznesradar.pl/gielda/indeks:WIG140';

async function scrapWig140Symbols(webContents: WebContents) {
  try {
    const res = await fetch(pageWig140);
    const html = await res.text();
    const $ = load(html);

    const matchedData: string[] = [];
    $('tr[data-blink-soid]').each((_i, row) => {
      const firstTd = $(row).find('td').first();
      if (firstTd.length) {
        const text = firstTd.text().trim();

        const match = text.match(/^([A-Z0-9]{3})/);
        if (match) matchedData.push(match[1]);
      }
    });

    if (matchedData.length !== 140) throw new Error(errors.cantGetWig140);

    return matchedData;
  } catch (err) {
    printAndSendError(webContents, scrapWig140Symbols.name, err);
  }
}

async function fetchTickers(webContents: WebContents, yahooFinance: YahooFinanceType) {
  try {
    const wig140Symbols = await scrapWig140Symbols(webContents);
    if (wig140Symbols === undefined) throw new Error(errors.cantGetWig140);

    const yahooSymbols = wig140Symbols.map(symbol => symbol + '.WA');

    const tickers = (await yahooFinance.quote(yahooSymbols, { fields: ['shortName'] }))
      .map(({ symbol, shortName }) => ({ symbol: (symbol as string).slice(0, 3), name: shortName as string }));

    if (tickers.length !== yahooSymbols.length) throw new Error(errors.cantGetYahooQuotes);

    const today = new Date();
    const tickersWithTimestamp = {
      timestamp: today,
      tickers
    };

    fs.mkdirSync(dataCacheDirname, { recursive: true });
    fs.writeFileSync(tickersCachePath, JSON.stringify(tickersWithTimestamp, null, 2));

    return tickers;
  } catch (err) {
    printAndSendError(webContents, fetchTickers.name, err);
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
      const freshTickers = await fetchTickers(webContents, yahooFinance);

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
      return await fetchTickers(webContents, yahooFinance);
    } else if (getErrorMsg(err) === errors.tickersCacheEmpty) {
      printAndSendError(webContents, getTickers.name, err);
      return await fetchTickers(webContents, yahooFinance);
    } else {
      printAndSendError(webContents, getTickers.name, err);
    }
  }
}