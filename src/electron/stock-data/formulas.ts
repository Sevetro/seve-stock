import { WebContents } from 'electron';

import { getHistoricStockData } from './historic-stock-data.js';
import { errors } from '../shared-with-ui/errors.js';
import { convertStringDateToStooqDate } from './utils.js';
import { printAndSendError, printAndSendLog } from '../utils/message.js';
import { logs } from '../shared-with-ui/logs.js';
import { getTickers } from './tickers.js';
import { YahooFinanceType } from '../main.js';
import { getCurrentPrice } from './current-price.js';

export async function getAvgPrice(symbol: string, stooqStartDate: string, webContents: WebContents) {
  const companyStockData = await getHistoricStockData(symbol, stooqStartDate, webContents);

  try {
    if (companyStockData === undefined) throw new Error(errors.getAvgPriceStockDataUndefined(symbol));
    if (companyStockData.length === 0) throw new Error(errors.getAvgPriceStockDataEmpty(symbol));

    const earliestAvailableData = companyStockData[0].date;
    if (convertStringDateToStooqDate(earliestAvailableData) > stooqStartDate) {
      printAndSendLog(webContents, getAvgPrice.name, logs.earliestAvailableData(symbol, earliestAvailableData));
    }

    return Number((companyStockData.reduce((acc, { avg }) => acc + avg, 0) / companyStockData.length).toFixed(2));
  } catch (err) {
    printAndSendError(webContents, getAvgPrice.name, err);
  }
}

export async function getCheapStocks(
  stooqStartDate: string, count: number, webContents: WebContents, yahooFinance: YahooFinanceType
) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers === undefined || tickers.length === 0) throw new Error('dupa'); //TODO
    const symbols = tickers.map(ticker => ticker.symbol);

    const currentPrices: Record<string, number | undefined> = {};
    await Promise.all(
      symbols.map(async symbol => {
        currentPrices[symbol] = await getCurrentPrice(symbol, yahooFinance, webContents);
      })
    );

    const avgPrices: Record<string, number | undefined> = {};
    for (const symbol of symbols) {
      avgPrices[symbol] = await getAvgPrice(symbol, stooqStartDate, webContents);
    }

    const cheapStocks = tickers.map(({ symbol, name }) => {
      if (currentPrices[symbol] === undefined) throw new Error(errors.currentPriceUndefined(symbol));
      if (avgPrices[symbol] === undefined) throw new Error(errors.avgPriceUndefined(symbol));

      return {
        symbol,
        name,
        discount: currentPrices[symbol] / avgPrices[symbol]
      };
    });

    return cheapStocks.sort((a, b) => a.discount - b.discount).slice(0, count);
  } catch (err) {
    printAndSendError(webContents, getCheapStocks.name, err);
  }
}