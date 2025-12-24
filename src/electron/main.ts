import { app, BrowserWindow } from 'electron';
import YahooFinance from 'yahoo-finance2';

import { ipcMainHandle, isDev } from './utils/core.js';
import { getPreloadPath, getUIPath } from './utils/path-resolver.js';
import { getTickers } from './stock-data/tickers.js';
import { getHistoricStockData } from './stock-data/historic-stock-data.js';
import { getBestDividends, getCheapStocks } from './stock-data/formulas.js';
import { getQuote } from './stock-data/quotes.js';
import { FundamentalsTimeSeriesFinancialsResult } from 'yahoo-finance2/modules/fundamentalsTimeSeries';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
export type YahooFinanceType = typeof yahooFinance;

app.whenReady().then(async () => {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      preload: getPreloadPath()
    }
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5132');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  // mainWindow.webContents.openDevTools();

  const { webContents } = mainWindow;
  ipcMainHandle('getTickers', () =>
    getTickers(webContents, yahooFinance));
  ipcMainHandle('getCompanyStockData', (symbol, stooqStartDate) =>
    getHistoricStockData(symbol, stooqStartDate, webContents));
  ipcMainHandle('getQuote', (symbol) =>
    getQuote(symbol, yahooFinance, webContents));
  ipcMainHandle('getCheapStocks', (stooqStartDate: string, count: number) =>
    getCheapStocks(stooqStartDate, count, webContents, yahooFinance));
  ipcMainHandle('getBestDividends', (count) =>
    getBestDividends(count, webContents, yahooFinance));

  const elo = await getQuote('PKP', yahooFinance, webContents);
  // const elo = await yahooFinance.quote('PEP.WA');
  // console.log(elo);

  function logInfo(data: any) {
    console.log('date:', data.date);
    console.log('totalRevenue:', data.totalRevenue.toLocaleString('eng').slice(0, -8));
    console.log('operatingRevenue:', data.operatingRevenue.toLocaleString('eng').slice(0, -8));
    console.log('totalExpenses:', data.totalExpenses.toLocaleString('eng').slice(0, -8));
    console.log('costOfRevenue:', data.costOfRevenue.toLocaleString('eng').slice(0, -8));
    console.log('grossProfit:', data.grossProfit.toLocaleString('eng').slice(0, -8));
    console.log('operatingIncome:', data.operatingIncome.toLocaleString('eng').slice(0, -8));
    console.log('EBITDA:', data.EBITDA.toLocaleString('eng').slice(0, -8));
    console.log('EBIT:', data.EBIT.toLocaleString('eng').slice(0, -8));
    console.log('netIncome:', data.netIncome.toLocaleString('eng').slice(0, -8));
    console.log('operatingExpense:', data.operatingExpense.toLocaleString('eng').slice(0, -8));
  }

  async function getTtmData(symbol: string) {
    const period1 = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const unfilteredResults = await yahooFinance.fundamentalsTimeSeries(symbol, {
      period1,
      module: 'financials',
      type: 'annual'
    });

    // just for typescript
    const financialResults: FundamentalsTimeSeriesFinancialsResult[] = unfilteredResults.filter(
      (item): item is FundamentalsTimeSeriesFinancialsResult => item.TYPE === 'FINANCIALS'
    );

    // console.log(financialResults[0]);

    logInfo(financialResults[0]);

    // console.log('1 =====================================');
    // logInfo(financialResults[0]);
    // console.log('2 =====================================');
    // logInfo(financialResults[1]);
    // console.log('3 =====================================');
    // logInfo(financialResults[2]);
    // console.log('4 =====================================');
    // logInfo(financialResults[3]);

    // in MLN
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
      // if (q.totalRevenue === undefined ||
      //   q.operatingRevenue === undefined ||
      //   q.operatingExpense === undefined ||
      //   q.netIncome === undefined) throw new Error('TODO');

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

    return {
      ...ttmFinancialResult,
      operatingMargin: (ttmFinancialResult.EBIT / ttmFinancialResult.totalRevenue * 100).toFixed(2)
    };
  }

  const ttmFinancialResult = await getTtmData('PKN.WA');

  mainWindow.on('closed', () => {
    app.quit();
  });
});