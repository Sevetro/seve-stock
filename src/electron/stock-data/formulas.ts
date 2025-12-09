import { WebContents } from 'electron';

import { getHistoricStockData } from './historic-stock-data.js';
import { errors } from '../shared-with-ui/errors.js';
import { convertStringDateToStooqDate } from './utils.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { logs } from '../shared-with-ui/logs.js';
import { getTickers } from './tickers.js';
import { YahooFinanceType } from '../main.js';
import { getCurrentPrice, getDividendYield } from './quotes.js';

export async function getAvgPrice(symbol: string, stooqStartDate: string, webContents: WebContents) {
  try {
    const companyStockData = await getHistoricStockData(symbol, stooqStartDate, webContents);

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

// Before changing the name, check out usage in messages source
export async function getCheapStocks(
  stooqStartDate: string, count: number, webContents: WebContents, yahooFinance: YahooFinanceType
) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers === undefined || tickers.length === 0) throw new Error(errors.cantGetTickers);
    const symbols = tickers.map(ticker => ticker.symbol);

    const currentPrices: Record<string, number> = {};
    const validPricesSymbols: string[] = [];
    await Promise.all(
      symbols.map(async symbol => {
        const currPrice = await getCurrentPrice(symbol, yahooFinance, webContents);
        if (currPrice === undefined) {
          printAndSendMsg(webContents, { msg: errors.cantGetCurrentPrice(symbol), source: getCheapStocks.name, type: 'error', details: { symbol } });
        } else {
          currentPrices[symbol] = currPrice;
          validPricesSymbols.push(symbol);
        }
      })
    );

    const avgPrices: Record<string, number> = {};
    const validAvgSymbols: string[] = [];
    for (const symbol of validPricesSymbols) {
      const avgPrice = await getAvgPrice(symbol, stooqStartDate, webContents);
      if (avgPrice === undefined) {
        printAndSendMsg(webContents, { msg: errors.cantGetAvgPrice(symbol), source: getCheapStocks.name, type: 'error', details: { symbol } });
      } else {
        avgPrices[symbol] = avgPrice;
        validAvgSymbols.push(symbol);
      }
    }

    const cheapStocks = tickers
      .filter(ticker => validAvgSymbols.includes(ticker.symbol))
      .map(({ symbol, name }) => ({
        symbol,
        name,
        discount: currentPrices[symbol] / avgPrices[symbol]
      }));

    return cheapStocks.sort((a, b) => a.discount - b.discount).slice(0, count);
  } catch (err) {
    printAndSendError(webContents, getCheapStocks.name, err);
  }
}

export async function getBestDividends(count: number, webContents: WebContents, yahooFinance: YahooFinanceType) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers == null || tickers.length === 0) throw new Error(errors.cantGetTickers);

    const bestDividends = await Promise.all(
      tickers.map(async ({ symbol, name }) => {
        const dividendYield = await getDividendYield(symbol, yahooFinance, webContents);
        if (dividendYield != null) {
          return {
            symbol,
            name,
            dividendYield
          };
        }
      })
    );

    return bestDividends
      .filter(val => val !== undefined)
      .sort((a, b) => b.dividendYield - a.dividendYield)
      .slice(0, count);
  } catch (err) {
    printAndSendError(webContents, getBestDividends.name, err);
  }
}