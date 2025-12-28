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
const biggest100Regex = /data-rowkey="GPW:([A-Z]+)/g;
const pageBiggest100 = 'https://pl.tradingview.com/markets/stocks-poland/market-movers-large-cap/';
const pageWig140 = 'https://www.biznesradar.pl/gielda/indeks:WIG140';

// return some strange companies with no data on yahoo
async function scrapBiggestSymbols(webContents: WebContents) {
  try {
    const res = await fetch(pageBiggest100);
    const html = await res.text();
    const matchedData = [...html.matchAll(biggest100Regex)];

    if (matchedData.length === 0) throw new Error(errors.cantScrap);

    return matchedData.map(match => `${match[1]}.WA`);
  } catch (err) {
    printAndSendError(webContents, scrapBiggestSymbols.name, err);
  }
}

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

    if (matchedData.length === 0) throw new Error(errors.cantScrap);

    return matchedData.map(match => `${match}.WA`);
  } catch (err) {
    printAndSendError(webContents, scrapWig140Symbols.name, err);
  }
}

async function combineScrappers(webContents: WebContents, yahooFinance: YahooFinanceType) {
  try {
    const symbolsWig140 = await scrapWig140Symbols(webContents);
    const symbols100Biggest: any = []; // returning strange stocks like OPG.WA
    // const symbols100Biggest = await scrapBiggestSymbols(webContents);

    if (symbolsWig140 === undefined || symbols100Biggest === undefined) throw new Error('Cant combine scrappers TODO');

    const newSet = new Set([...symbolsWig140, ...symbols100Biggest]);
    const yahooSymbols = Array.from(newSet);

    const tickers = (await yahooFinance.quote(yahooSymbols, { fields: ['shortName'] }))
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
    printAndSendError(webContents, combineScrappers.name, err);
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
      const freshTickers = await combineScrappers(webContents, yahooFinance);

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
      return await combineScrappers(webContents, yahooFinance);
    } else if (getErrorMsg(err) === errors.tickersCacheEmpty) {
      printAndSendError(webContents, getTickers.name, err);
      return await combineScrappers(webContents, yahooFinance);
    } else {
      printAndSendError(webContents, getTickers.name, err);
    }
  }
}