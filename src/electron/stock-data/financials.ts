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
    })).filter(
      (item: any): item is FundamentalsTimeSeriesFinancialsResult => item.TYPE === 'FINANCIALS'
    );

    if (ttmFinancialResults?.[0] === undefined) throw new Error(errors.cantFetchTtmFinancialData(yahooSymbol));

    const {
      totalRevenue, grossProfit, operatingIncome, EBITDA, EBIT, netIncome
    }: RawTtmFinancialData = ttmFinancialResults[0];

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
      // printAndSendLog(webContents, getTtmFinancialData.name, logs.staleTtmFinancialData(symbol));

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