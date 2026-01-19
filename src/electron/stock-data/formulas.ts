import { WebContents } from 'electron';

import { getHistoricData } from './historic-data.js';
import { errors } from '../shared-with-ui/errors.js';
import { inMinMaxRange, numberToFixed } from './utils.js';
import { printAndSendError, printAndSendMsg } from '../utils/message.js';
import { getTickers } from './tickers.js';
import { YahooFinanceType } from '../main.js';
import { getQuote } from './quotes.js';
import { getTtmFinancialData } from './financials.js';
import { getDividend } from './dividend.js';

async function getAvgPrice(
  symbol: string,
  startDate: Date,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const historicData = await getHistoricData(symbol, startDate, yahooFinance, webContents);

    if (historicData === undefined) throw new Error(errors.cantGetHistoricData(symbol));

    return numberToFixed(historicData.reduce((acc, { avg }) => acc + avg, 0) / historicData.length, 2);
  } catch (err) {
    printAndSendError(webContents, getAvgPrice.name, err);
  }
}

async function getHighestPrice(
  symbol: string,
  startDate: Date,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const historicData = await getHistoricData(symbol, startDate, yahooFinance, webContents);

    if (historicData === undefined) throw new Error(errors.cantGetHistoricData(symbol));

    return historicData.sort((a, b) => a.high - b.high)[historicData.length - 1].high;
  } catch (err) {
    printAndSendError(webContents, getAvgPrice.name, err);
  }
}

export async function getBiggestGaps(
  startDate: Date,
  count: number,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers === undefined) throw new Error(errors.cantGetTickers);

    const prices = await Promise.all(
      tickers.map(
        async ({ symbol, name }) => {
          const currPrice = (await getQuote(symbol, yahooFinance, webContents))?.price;
          const highestPrice = await getHighestPrice(symbol, startDate, yahooFinance, webContents);

          if (currPrice === undefined || highestPrice === undefined)
            throw new Error('Invalid symbol data TODO');

          return {
            symbol,
            name,
            gap: Number((currPrice / highestPrice * 100).toFixed(0))
          };
        }
      )
    );

    return prices
      .sort((a, b) => a.gap - b.gap)
      .slice(0, count);
  } catch (err) {
    printAndSendError(webContents, getBiggestGaps.name, err);
  }

}

export async function getCombinedInfo(
  symbol: string,
  startDate: Date,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {

  try {
    const quote = await getQuote(symbol, yahooFinance, webContents);
    const ttmFinancialData = await getTtmFinancialData(symbol, yahooFinance, webContents);
    const avgPrice = await getAvgPrice(symbol, startDate, yahooFinance, webContents);
    const highestPrice = await getHighestPrice(symbol, startDate, yahooFinance, webContents);

    if (quote === undefined ||
      ttmFinancialData === undefined ||
      avgPrice === undefined ||
      highestPrice === undefined) throw new Error(errors.cantGetCombinedInfo(symbol));

    const dividend = await getDividend(symbol, yahooFinance, webContents);
    const priceChange = numberToFixed(quote.price / avgPrice * 100, 0);
    const priceGap = numberToFixed(quote.price / highestPrice * 100, 0);

    const combinedInfo: CombinedInfo = {
      ...quote,
      ...ttmFinancialData,
      dividend,
      priceChange,
      priceGap
    };

    return combinedInfo;
  } catch (err) {
    printAndSendError(webContents, getCombinedInfo.name, err);
  }
}

// Before changing the name, check out usage in messages source
export async function getCheapStocks(
  startDate: Date,
  count: number,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers === undefined) throw new Error(errors.cantGetTickers);

    const tickersWithPriceChange = await Promise.all(
      tickers.map(async ({ symbol, name }) => {
        const currPrice = (await getQuote(symbol, yahooFinance, webContents))?.price;
        if (currPrice === undefined) {
          printAndSendMsg(webContents, {
            msg: errors.cantGetCurrentPrice(symbol),
            source: getCheapStocks.name,
            type: 'error',
            details: { symbol }
          });
          return;
        }
        const avgPrice = await getAvgPrice(symbol, startDate, yahooFinance, webContents);
        if (avgPrice === undefined) {
          printAndSendMsg(webContents, {
            msg: errors.cantGetAvgPrice(symbol),
            source: getCheapStocks.name,
            type: 'error',
            details: { symbol }
          });
          return;
        }
        const discount = numberToFixed(currPrice / avgPrice * 100, 0);

        return {
          symbol,
          name,
          discount
        };
      })
    );

    return tickersWithPriceChange
      .filter((ticker) => ticker !== undefined)
      .sort((a, b) => a.discount - b.discount)
      .slice(0, count);
  } catch (err) {
    printAndSendError(webContents, getCheapStocks.name, err);
  }
}

export async function getBestDividends(
  count: number,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers === undefined) throw new Error(errors.cantGetTickers);

    const bestDividends = await Promise.all(
      tickers.map(async ({ symbol, name }) => {
        const dividend = await getDividend(symbol, yahooFinance, webContents);
        if (dividend != null) {
          return {
            symbol,
            name,
            dividend
          };
        }
      })
    );

    return bestDividends
      .filter(val => val !== undefined)
      .sort((a, b) => b.dividend - a.dividend)
      .slice(0, count);
  } catch (err) {
    printAndSendError(webContents, getBestDividends.name, err);
  }
}

export async function getAdvancedFiltersResult(
  advancedFilters: Partial<AdvancedFilters>,
  startDate: Date,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  try {
    const tickers = await getTickers(webContents, yahooFinance);
    if (tickers == null) throw new Error(errors.cantGetTickers);

    const allStocksInfo = await Promise.all(
      tickers.map(async ({ symbol, name }) => {
        const combinedInfo = await getCombinedInfo(symbol, startDate, yahooFinance, webContents);
        return {
          symbol,
          name,
          ...combinedInfo
        };
      })
    );

    return allStocksInfo
      .filter(company => Object.entries(advancedFilters)
        .every(([key, { min, max }]) => {
          const value = company[key as AdvancedFiltersKey];
          return inMinMaxRange(value, min, max);
        }))
      .map((company) => ({ symbol: company!.symbol, name: company!.name }));
  } catch (err) {
    printAndSendError(webContents, getAdvancedFiltersResult.name, err);
  }
}