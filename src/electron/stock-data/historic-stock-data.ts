import path from 'path';
import fs from 'fs';
import { differenceInMinutes, subYears } from 'date-fns';
import { WebContents } from 'electron';

import { dataCacheDirname } from './constants.js';
import { StockRecordCache } from './types.js';
import { convertStringDateToStooqDate, timestampParser } from './utils.js';
import { fetchingPeriodYears, staleStockDataMinutes } from './config.js';
import { printAndSendError, printAndSendLog } from '../utils/message.js';
import { errors } from '../shared-with-ui/errors.js';
import { getErrorMsg, isError } from '../utils/error.js';
import { logs } from '../shared-with-ui/logs.js';
import { convertNativeDateToStooqDate } from '../shared-with-ui/date.js';

const historicCachePath = path.join(dataCacheDirname, 'historic');

function createStockDataObject(record: string): StockDataRecord {
  const recordData = record.split(',');
  const open = parseFloat(recordData[1]);
  const high = parseFloat(recordData[2]);
  const low = parseFloat(recordData[3]);
  const close = parseFloat(recordData[4]);
  const avg = Number(((open + high + low + close) / 4).toFixed(3));

  return {
    date: recordData[0],
    open,
    high,
    low,
    close,
    avg
  };
}

async function fetchHistoricStockData(symbol: string, webContents: WebContents) {
  const today = convertNativeDateToStooqDate(new Date());
  const startDate = convertNativeDateToStooqDate(subYears(new Date(), fetchingPeriodYears));
  const url = `https://stooq.com/q/d/l/?s=${symbol}&d1=${startDate}&d2=${today}&i=d`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(errors.responseNotOk(res.status, symbol));

    const data = await res.text();
    if (!data || data.trim().length === 0) throw new Error(errors.emptyStockDataResponse(symbol));
    if (data === 'Exceeded the daily hits limit') throw new Error(errors.exceededDailyHitsLimit(symbol));
    if (data === 'No data') throw new Error(errors.noAvailableStockData(symbol));

    const records = data.trim().split(/\r?\n/);
    records.shift();
    const stockData = records.map(record => createStockDataObject(record));
    const today = new Date();

    const stockDataWithTimestamp = {
      timestamp: today,
      stockData
    };

    const filePath = path.join(historicCachePath, `${symbol}.json`);
    fs.mkdirSync(historicCachePath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(stockDataWithTimestamp, null, 2));

    return stockData;
  } catch (err) {
    console.log(err);
    printAndSendError(webContents, fetchHistoricStockData.name, err);
  }
}

export async function getHistoricStockData(symbol: string, stooqStartDate: string, webContents: WebContents) {
  const endDate = convertNativeDateToStooqDate(new Date());
  let finalStockData: CompanyStockData | undefined;
  const filePath = path.join(historicCachePath, `${symbol}.json`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: StockRecordCache = JSON.parse(rawData, timestampParser);
    const { timestamp, stockData } = parsedData;

    if (stockData.length === 0) throw new Error(logs.emptyTickerCache(symbol));

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);

    if (minutesSinceUpdate >= staleStockDataMinutes) {
      printAndSendLog(webContents, getHistoricStockData.name, logs.stockDataStale(symbol));
      const freshStockData = await fetchHistoricStockData(symbol, webContents);

      if (freshStockData === undefined || freshStockData.length === 0) {
        printAndSendLog(webContents, getHistoricStockData.name, errors.freshStockDataUnavailable(symbol));
        finalStockData = stockData;
      } else {
        finalStockData = freshStockData;
      }

    } else {
      finalStockData = stockData;
    }
  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getHistoricStockData.name, logs.tickerCacheNotFound(symbol));
      finalStockData = await fetchHistoricStockData(symbol, webContents);
    }
    else if (getErrorMsg(err) === logs.emptyTickerCache(symbol)) {
      printAndSendLog(webContents, getHistoricStockData.name, logs.emptyTickerCache(symbol));
      finalStockData = await fetchHistoricStockData(symbol, webContents);
    }
    else {
      printAndSendError(webContents, getHistoricStockData.name, err);
    }
  }

  return finalStockData?.filter((stockRecord) =>
    convertStringDateToStooqDate(stockRecord.date) >= stooqStartDate &&
    convertStringDateToStooqDate(stockRecord.date) <= endDate);
}