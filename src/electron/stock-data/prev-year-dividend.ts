import fs from 'fs';
import path from 'path';
import { WebContents } from 'electron';

import { YahooFinanceType } from '../main.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { dataCacheDirname } from './constants.js';
import { PrevYearDividendDataCache } from './types.js';
import { timestampParser } from './utils.js';
import { differenceInHours, getYear } from 'date-fns';
import { stalePrevYearDividendHours } from './config.js';
import { errors, isError } from '../shared-with-ui/errors.js';
import { logs } from '../shared-with-ui/logs.js';

const prevYearDividendDataCachePath = path.join(dataCacheDirname, 'prev-year-dividend-data');

async function fetchPrevYearDividend(
  symbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const today = new Date();
    const period1 = `${getYear(today) - 1}-01-01`;
    const period2 = `${getYear(today) - 1}-12-31`;
    const chartData = await yahooFinance.chart(symbol + '.WA', { period1, period2 });

    const prevYearDividendValue = chartData?.events?.dividends?.reduce((acc, div) => acc += div.amount, 0) ?? 0;

    const prevYearValidQuotes = chartData.quotes.reduce((acc, quote) => {
      if (quote.close != null) {
        return {
          count: acc.count + 1,
          sum: acc.sum + quote.close
        };
      }
      return acc;
    }, { count: 0, sum: 0 });

    // Bail out before dividing by zero / caching NaN if the previous year has no usable quotes
    if (prevYearValidQuotes.count === 0) throw new Error(errors.invalidData(symbol));

    const prevYearDividendToAvgPrice = Number((100 * prevYearDividendValue / (prevYearValidQuotes.sum / prevYearValidQuotes.count)).toFixed(1));

    const currPrice = chartData.meta.regularMarketPrice;
    if (!Number.isFinite(currPrice) || currPrice <= 0) throw new Error(errors.invalidData(symbol));

    const prevYearDividendToCurrPrice = Number((prevYearDividendValue / currPrice * 100).toFixed(1));

    const dividendDataWithTimestamp: PrevYearDividendDataCache = {
      timestamp: new Date(),
      prevYearDividendValue,
      prevYearDividendToCurrPrice,
      prevYearDividendToAvgPrice
    };

    fs.mkdirSync(prevYearDividendDataCachePath, { recursive: true });
    const filePath = path.join(prevYearDividendDataCachePath, `${symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dividendDataWithTimestamp, null, 2));

    return {
      prevYearDividendValue,
      prevYearDividendToCurrPrice,
      prevYearDividendToAvgPrice
    };
  } catch (err) {
    printAndSendError(webContents, fetchPrevYearDividend.name, err);
  }
}

export async function getPrevYearDividend(
  symbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  const filePath = path.join(prevYearDividendDataCachePath, `${symbol}.json`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: PrevYearDividendDataCache = JSON.parse(rawData, timestampParser);
    const { timestamp, ...cachedPrevYearDividend } = parsedData;

    const hoursSinceUpdate = differenceInHours(new Date(), timestamp);
    if (hoursSinceUpdate >= stalePrevYearDividendHours) {
      const freshPrevYearDividend = await fetchPrevYearDividend(symbol, yahooFinance, webContents);
      if (freshPrevYearDividend == null) {
        printAndSendMsg(webContents, {
          msg: errors.freshDividendUnavailable(symbol),
          source: getPrevYearDividend.name,
          type: 'error',
          details: { symbol }
        });
        return cachedPrevYearDividend;

      } else return freshPrevYearDividend;

    } else return cachedPrevYearDividend;

  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getPrevYearDividend.name, logs.dividendCacheNotFound(symbol));
      return await fetchPrevYearDividend(symbol, yahooFinance, webContents);
    } else {
      printAndSendError(webContents, getPrevYearDividend.name, err);
    }
  }
}