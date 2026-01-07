import path from 'path';
import fs from 'fs';
import { differenceInHours, isBefore, subYears } from 'date-fns';
import { WebContents } from 'electron';
import { ChartResultArrayQuote } from 'yahoo-finance2/modules/chart';

import { dataCacheDirname } from './constants.js';
import { HistoricDataCache } from './types.js';
import { historicCacheParser } from './utils.js';
import { fetchingPeriodYears, staleHistoricDataHours } from './config.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { errors, getErrorMsg, isError } from '../shared-with-ui/errors.js';
import { logs } from '../shared-with-ui/logs.js';
import { YahooFinanceType } from '../main.js';

const historicCachePath = path.join(dataCacheDirname, 'historic');

function adjustHistoricData({ date, ...quote }: ChartResultArrayQuote): HistoricDataRecord {
  const open = Number(quote.open?.toFixed(4));
  const high = Number(quote.high?.toFixed(4));
  const low = Number(quote.low?.toFixed(4));
  const close = Number(quote.close?.toFixed(4));
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
    const historicData = chartData.quotes.map(adjustHistoricData);

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

    if (cachedHistoricData.length === 0) throw new Error(logs.emptyHistoricDataCache(symbol));

    const hoursSinceUpdate = differenceInHours(new Date(), timestamp);
    if (hoursSinceUpdate >= staleHistoricDataHours) {
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
    }
    else if (getErrorMsg(err) === logs.emptyHistoricDataCache(symbol)) {
      printAndSendLog(webContents, getHistoricData.name, logs.emptyHistoricDataCache(symbol));
      historicData = await fetchHistoricData(symbol, yahooFinance, webContents);
    }
    else {
      printAndSendError(webContents, getHistoricData.name, err);
    }
  }

  return historicData?.filter(({ date }) => !isBefore(date, startDate));
}