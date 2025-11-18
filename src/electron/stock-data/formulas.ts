import { WebContents } from 'electron';

import { getFreshStockData } from './stock-data.js';
import { errors } from '../shared-with-ui/errors.js';
import { convertStringDateToStooqDate } from './utils.js';
import { printAndSendError, printAndSendLog } from '../utils/message.js';
import { logs } from '../shared-with-ui/logs.js';

export async function getAvgPrice(ticker: string, stooqStartDate: string, webContents: WebContents) {
  const companyStockData = await getFreshStockData(ticker, stooqStartDate, webContents);

  try {
    if (companyStockData === undefined) throw new Error(errors.getAvgPriceStockDataUndefined(ticker));
    if (companyStockData.length === 0) throw new Error(errors.getAvgPriceStockDataEmpty(ticker));

    const earliestAvailableData = companyStockData[0].date;
    if (convertStringDateToStooqDate(earliestAvailableData) > stooqStartDate) {
      printAndSendLog(webContents, getAvgPrice.name, logs.earliestAvailableData(ticker, earliestAvailableData));
    }

    return companyStockData.reduce((acc, { avg }) => acc + avg, 0) / companyStockData.length;
  } catch (err) {
    printAndSendError(webContents, getAvgPrice.name, err);
  }
}

function getCheapestDay(stockData: CompanyStockData | undefined) {
  if (stockData == null || stockData.length === 0) return;
  return stockData.sort((a, b) => a.avg - b.avg)[0];
}

export function getCurrentDiscount(avgPrice: number, currentPrice: number) {
  if (avgPrice == null || currentPrice == null) return;
  if (avgPrice === 0 || currentPrice === 0) return;

  return currentPrice / avgPrice;
}