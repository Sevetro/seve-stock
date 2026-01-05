import { app, BrowserWindow } from 'electron';
import YahooFinance from 'yahoo-finance2';

import { ipcMainHandle, isDev } from './utils/core.js';
import { getPreloadPath, getUIPath } from './utils/path-resolver.js';
import { getTickers } from './stock-data/tickers.js';
import { getHistoricData } from './stock-data/historic-data.js';
import { getAdvancedFiltersResult, getBestDividends, getCheapStocks, getCombinedInfo } from './stock-data/formulas.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
export type YahooFinanceType = typeof yahooFinance;

app.whenReady().then(async () => {
  const mainWindow = new BrowserWindow({
    // width: 1600,
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
    getHistoricData(symbol, stooqStartDate, webContents));
  ipcMainHandle('getCombinedInfo', (symbol, stooqStartDate) =>
    getCombinedInfo(symbol, stooqStartDate, yahooFinance, webContents));
  ipcMainHandle('getCheapStocks', (stooqStartDate: string, count: number) =>
    getCheapStocks(stooqStartDate, count, webContents, yahooFinance));
  ipcMainHandle('getBestDividends', (count) =>
    getBestDividends(count, webContents, yahooFinance));
  ipcMainHandle('getAdvancedFiltersResult', (advancedFilters, stooqStartDate) =>
    getAdvancedFiltersResult(advancedFilters, stooqStartDate, yahooFinance, webContents));

  mainWindow.on('closed', () => {
    app.quit();
  });
});