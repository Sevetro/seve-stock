import fs from 'fs';
import path from 'path';
import { WebContents } from 'electron';
import { FundamentalsTimeSeriesFinancialsResult } from 'yahoo-finance2/modules/fundamentalsTimeSeries';
import { differenceInHours } from 'date-fns';

import { YahooFinanceType } from '../main.js';
import { TtmFinancialDataCache } from './types.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { errors, isError } from '../shared-with-ui/errors.js';
import { dataCacheDirname } from './constants.js';
import { timestampParser } from './utils.js';
import { staleTtmFinancialDataHours } from './config.js';
import { logs } from '../shared-with-ui/logs.js';

const ttmFinancialDataCachePath = path.join(dataCacheDirname, 'ttm-financial-data');

async function fetchTtmFinancialData(
  yahooSymbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  const period1 = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  try {
    const ttmFinancialResults = (await yahooFinance.fundamentalsTimeSeries(yahooSymbol, {
      period1,
      module: 'financials',
      type: 'trailing'
    }, {
      validateResult: false
    })).filter((item: any): item is FundamentalsTimeSeriesFinancialsResult => item.TYPE === 'FINANCIALS');

    if (ttmFinancialResults?.[0] === undefined) throw new Error(errors.cantFetchTtmFinancialData(yahooSymbol));

    const { totalRevenue, grossProfit, operatingIncome, EBITDA,
      EBIT, netIncome }: RawTtmFinancialData = ttmFinancialResults[0];

    const ttmFinancialData: TtmFinancialData = {
      totalRevenue,
      grossProfit,
      operatingIncome,
      EBITDA,
      EBIT,
      netIncome,
      grossProfitMargin: Number((grossProfit / totalRevenue * 100).toFixed(2)),
      operatingMargin: Number((operatingIncome / totalRevenue * 100).toFixed(2)),
      ebitMargin: Number((EBIT / totalRevenue * 100).toFixed(2)),
      netIncomeMargin: Number((netIncome / totalRevenue * 100).toFixed(2))
    };

    const today = new Date();
    const financialDataWithTimestamp = {
      timestamp: today,
      ...ttmFinancialData
    };

    const symbol = yahooSymbol.slice(0, -3);
    fs.mkdirSync(ttmFinancialDataCachePath, { recursive: true });
    const filePath = path.join(ttmFinancialDataCachePath, `${symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(financialDataWithTimestamp, null, 2));

    return ttmFinancialData;
  } catch (err) {
    printAndSendError(webContents, fetchTtmFinancialData.name, err);
  }
}

export async function getTtmFinancialData(
  symbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  const filePath = path.join(ttmFinancialDataCachePath, `${symbol}.json`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: TtmFinancialDataCache = JSON.parse(rawData, timestampParser);
    const { timestamp, ...ttmFinancialData } = parsedData;

    const hoursSinceUpdate = differenceInHours(new Date(), timestamp);
    if (hoursSinceUpdate >= staleTtmFinancialDataHours) {
      printAndSendLog(webContents, getTtmFinancialData.name, logs.staleTtmFinancialData(symbol));

      const freshTtmFinancialData = await fetchTtmFinancialData(symbol + '.WA', yahooFinance, webContents);
      if (freshTtmFinancialData === undefined) {
        printAndSendMsg(webContents, {
          msg: errors.freshTtmFinancialDataUnavailable(symbol),
          source: getTtmFinancialData.name,
          type: 'error',
          details: { symbol }
        });

        return ttmFinancialData;
      } else {
        return freshTtmFinancialData;
      }

    } else {
      return ttmFinancialData;
    }
  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getTtmFinancialData.name, logs.ttmFinancialDataCacheNotFound(symbol));
      return await fetchTtmFinancialData(symbol + '.WA', yahooFinance, webContents);
    } else {
      printAndSendError(webContents, getTtmFinancialData.name, err);
    }
  }
}

async function getLast4FinancialQuarters(
  yahooSymbol: string,
  yahooFinance: YahooFinanceType,
  webContents: WebContents
) {
  const period1 = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const financialResults = (await yahooFinance.fundamentalsTimeSeries(yahooSymbol, {
      period1,
      module: 'financials'
    })).filter((item): item is FundamentalsTimeSeriesFinancialsResult => item.TYPE === 'FINANCIALS');

    if (financialResults.length < 4) {
      throw new Error(errors.notEnoughFinancialQuarters(yahooSymbol));
    }

    // logInfo(financialResults[0]);

    // console.log('1 =====================================');
    // logInfo(financialResults[0]);
    // console.log('2 =====================================');
    // logInfo(financialResults[1]);
    // console.log('3 =====================================');
    // logInfo(financialResults[2]);
    // console.log('4 =====================================');
    // logInfo(financialResults[3]);

    //  totalRevenue
    //  operatingRevenue
    //  totalExpenses
    //  costOfRevenue
    //  grossProfit = revenue - costOfRevenue
    //  operatingExpense
    //  operatingIncome = revenue - totalExpenses || grossProfit - operatingExpense (zysk ze sprzedaży)
    //  EBITDA
    //  EBIT
    //  netIncome (zysk netto)

    const ttmFinancialResult = financialResults.slice(-4).reduce((acc, q) => {
      acc.EBIT += q.EBIT!;
      acc.totalRevenue += q.totalRevenue!;
      acc.operatingRevenue += q.operatingRevenue!;
      acc.netIncome += q.netIncome!;
      acc.totalExpenses += q.totalExpenses!;
      acc.costOfRevenue += q.costOfRevenue!;
      acc.grossProfit += q.grossProfit!;
      acc.operatingExpense += q.operatingExpense!;
      acc.operatingIncome += q.operatingIncome!;
      acc.EBITDA += q.EBITDA!;

      return acc;
    }, {
      EBIT: 0, totalRevenue: 0, operatingRevenue: 0, netIncome: 0,
      operatingExpense: 0, totalExpenses: 0, costOfRevenue: 0, grossProfit: 0,
      operatingIncome: 0, EBITDA: 0
    });

    // console.log('TTM =====================================');
    // logInfo(ttmFinancialResult);

    return {
      ...ttmFinancialResult,
      operatingMargin: (ttmFinancialResult.EBIT / ttmFinancialResult.totalRevenue * 100).toFixed(2)
    };
  } catch (err) {
    printAndSendError(webContents, getLast4FinancialQuarters.name, err);
  }
}