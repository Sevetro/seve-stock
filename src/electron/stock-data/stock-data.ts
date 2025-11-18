import path from 'path';
import fs from 'fs';
import { differenceInMinutes, subYears } from 'date-fns';
import { WebContents } from 'electron';

import { dataCacheDirname } from './constants.js';
import { StockRecordCache } from './types.js';
import { convertNativeDateToStooqDate, convertStringDateToStooqDate, timestampParser } from './utils.js';
import { fetchingPeriodYears, staleStockDataMinutes } from './config.js';
import { printAndSendError, printAndSendLog } from '../utils/message.js';
import { errors } from '../shared-with-ui/errors.js';
import { getErrorMsg, isError } from '../utils/error.js';
import { logs } from '../shared-with-ui/logs.js';

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

async function fetchStockData(ticker: string, webContents: WebContents) {
  const today = convertNativeDateToStooqDate(new Date());
  const startDate = convertNativeDateToStooqDate(subYears(new Date(), fetchingPeriodYears));
  const url = `https://stooq.com/q/d/l/?s=${ticker}&d1=${startDate}&d2=${today}&i=d`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${ticker}`);

    const data = await res.text();
    if (!data || data.trim().length === 0) throw new Error(`${errors.emptyStockDataResponse} ${ticker}.`);
    if (data === 'Exceeded the daily hits limit') throw new Error(`${errors.exceededDailyHitsLimit} ${ticker}.`);
    if (data === 'No data') throw new Error(`${errors.noAvailableStockData} ${ticker}.`);

    const records = data.trim().split(/\r?\n/);
    records.shift();
    const stockData = records.map(record => createStockDataObject(record));
    const today = new Date();

    const stockDataWithTimestamp = {
      timestamp: today,
      stockData
    };

    const filePath = path.join(dataCacheDirname, `${ticker}.json`);
    fs.mkdirSync(dataCacheDirname, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(stockDataWithTimestamp, null, 2));

    return stockData;

  } catch (err) {
    printAndSendError(webContents, fetchStockData.name, err);
  }
}

export async function getFreshStockData(ticker: string, stooqStartDate: string, webContents: WebContents) {
  const endDate = convertNativeDateToStooqDate(new Date());
  const filePath = path.join(dataCacheDirname, `${ticker}.json`);
  let finalStockData: CompanyStockData | undefined;

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: StockRecordCache = JSON.parse(rawData, timestampParser);
    const { timestamp, stockData } = parsedData;

    if (stockData.length === 0) throw new Error(`${ticker} ${logs.emptyTickerCache}`);

    const minutesSinceUpdate = differenceInMinutes(new Date(), timestamp);

    if (minutesSinceUpdate >= staleStockDataMinutes) {
      printAndSendLog(webContents, getFreshStockData.name, `${ticker} ${logs.stockDataStale}`);
      const freshStockData = await fetchStockData(ticker, webContents);

      if (freshStockData === undefined || freshStockData.length === 0) {
        printAndSendLog(webContents, getFreshStockData.name, `${ticker} ${errors.freshStockDataUnavailable}`);
        finalStockData = stockData;
      } else {
        finalStockData = freshStockData;
      }

    } else {
      finalStockData = stockData;
    }

  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getFreshStockData.name, `${ticker} ${logs.tickerCacheNotFound}`);
      finalStockData = await fetchStockData(ticker, webContents);
    }
    else if (getErrorMsg(err) === `${ticker} ${logs.emptyTickerCache}`) {
      printAndSendLog(webContents, getFreshStockData.name, `${ticker} ${logs.emptyTickerCache}`);
      finalStockData = await fetchStockData(ticker, webContents);
    }
    else {
      printAndSendError(webContents, getFreshStockData.name, err);
    }
  }

  return finalStockData?.filter((stockRecord) =>
    convertStringDateToStooqDate(stockRecord.date) >= stooqStartDate &&
    convertStringDateToStooqDate(stockRecord.date) <= endDate);
}