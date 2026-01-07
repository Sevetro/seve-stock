import fs from 'fs';
import path from 'path';
import { WebContents } from 'electron';

import { YahooFinanceType } from '../main.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { dataCacheDirname } from './constants.js';
import { DividendCache } from './types.js';
import { timestampParser } from './utils.js';
import { differenceInHours } from 'date-fns';
import { staleDividendHours } from './config.js';
import { errors, isError } from '../shared-with-ui/errors.js';
import { logs } from '../shared-with-ui/logs.js';

const dividendDataCachePath = path.join(dataCacheDirname, 'dividend-data');

async function fetchDividend(
  symbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const today = new Date();
    const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().slice(0, 10);

    const chartData = await yahooFinance.chart(symbol + '.WA', {
      period1: oneYearAgo,
      events: 'dividends'
    });

    const ttmDividendsSum = chartData.events?.dividends?.reduce((acc, dividend) => {
      acc += dividend.amount;
      return acc;
    }, 0);

    const price = chartData.meta.regularMarketPrice;
    const dividend = ttmDividendsSum === undefined
      ? 0
      : Number((ttmDividendsSum / price * 100).toFixed(1));

    const dividendDataWithTimestamp = {
      timestamp: new Date(),
      dividend
    };

    fs.mkdirSync(dividendDataCachePath, { recursive: true });
    const filePath = path.join(dividendDataCachePath, `${symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dividendDataWithTimestamp, null, 2));

    return dividend;
  } catch (err) {
    printAndSendError(webContents, fetchDividend.name, err);
  }
}

export async function getDividend(
  symbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  const filePath = path.join(dividendDataCachePath, `${symbol}.json`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: DividendCache = JSON.parse(rawData, timestampParser);
    const { timestamp, dividend } = parsedData;

    const hoursSinceUpdate = differenceInHours(new Date(), timestamp);
    if (hoursSinceUpdate >= staleDividendHours) {

      const freshDividend = await fetchDividend(symbol, yahooFinance, webContents);
      if (freshDividend === undefined) {
        printAndSendMsg(webContents, {
          msg: errors.freshDividendUnavailable(symbol),
          source: getDividend.name,
          type: 'error',
          details: { symbol }
        });
        return dividend;

      } else return freshDividend;

    } else return dividend;

  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getDividend.name, logs.dividendCacheNotFound(symbol));
      return await fetchDividend(symbol, yahooFinance, webContents);
    } else {
      printAndSendError(webContents, getDividend.name, err);
    }
  }
}