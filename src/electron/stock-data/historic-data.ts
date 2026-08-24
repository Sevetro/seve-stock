import path from 'path';
import fs from 'fs';
import { differenceInMinutes, isBefore, subYears } from 'date-fns';
import { WebContents } from 'electron';
import { ChartResultArrayQuote } from 'yahoo-finance2/modules/chart';

import { dataCacheDirname } from './constants.js';
import { HistoricDataCache } from './types.js';
import { historicCacheParser } from './utils.js';
import { fetchingPeriodYears, staleHistoricDataMinutes } from './config.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { errors, isError } from '../shared-with-ui/errors.js';
import { logs } from '../shared-with-ui/logs.js';
import { YahooFinanceType } from '../main.js';

const historicCachePath = path.join(dataCacheDirname, 'historic');

function adjustHistoricData({ date, ...quote }: ChartResultArrayQuote): HistoricDataRecord | null {
  const open = Number(quote.open?.toFixed(4));
  const high = Number(quote.high?.toFixed(4));
  const low = Number(quote.low?.toFixed(4));
  const close = Number(quote.close?.toFixed(4));

  // Yahoo occasionally returns quotes with missing/null OHLC fields; skip those rather than caching NaN
  if (![open, high, low, close].every(Number.isFinite)) return null;

  const avg = Number(((open + high + low + close) / 4).toFixed(4));

  return {
    date,
    open,
    high,
    low,
    close,
    avg
  };
}

async function fetchHistoricData(
  symbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  const today = new Date();
  const startDate = subYears(today, fetchingPeriodYears);
  try {
    const chartData = await yahooFinance.chart(symbol + '.WA', { period1: startDate });
    const adjustedQuotes = chartData.quotes.map(adjustHistoricData);
    const historicData = adjustedQuotes.filter((record): record is HistoricDataRecord => record !== null);

    const skippedCount = adjustedQuotes.length - historicData.length;
    if (skippedCount > 0) {
      printAndSendLog(webContents, fetchHistoricData.name, logs.skippedInvalidHistoricRecords(symbol, skippedCount));
    }

    if (historicData.length === 0) throw new Error(errors.noHistoricData(symbol));

    const stockDataWithTimestamp = {
      timestamp: today,
      historicData
    };

    const filePath = path.join(historicCachePath, `${symbol}.json`);
    fs.mkdirSync(historicCachePath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(stockDataWithTimestamp, null, 2));

    return historicData;
  } catch (err) {
    printAndSendError(webContents, fetchHistoricData.name, err);
  }
}

// Name of the function used in error recognition
export async function getHistoricData(
  symbol: string,
  startDate: Date,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  let historicData: HistoricData | undefined;
  const filePath = path.join(historicCachePath, `${symbol}.json`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: HistoricDataCache = JSON.parse(rawData, historicCacheParser);
    const { timestamp, historicData: cachedHistoricData } = parsedData;

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);
    if (minutesSinceUpdate >= staleHistoricDataMinutes) {
      const freshHistoricData = await fetchHistoricData(symbol, yahooFinance, webContents);

      if (freshHistoricData === undefined || freshHistoricData.length === 0) {
        printAndSendMsg(webContents, {
          msg: errors.freshHistoricDataUnavailable(symbol),
          source: getHistoricData.name,
          type: 'error',
          details: { symbol }
        });
        historicData = cachedHistoricData;

      } else historicData = freshHistoricData;

    } else historicData = cachedHistoricData;

  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getHistoricData.name, logs.historicCacheNotFound(symbol));
      historicData = await fetchHistoricData(symbol, yahooFinance, webContents);
    } else {
      printAndSendError(webContents, getHistoricData.name, err);
    }
  }

  return historicData?.filter(({ date }) => !isBefore(date, startDate));
}