import { app, BrowserWindow } from 'electron';
import YahooFinance from 'yahoo-finance2';

import { ipcMainHandle, isDev } from './utils/core.js';
import { getPreloadPath, getUIPath } from './utils/path-resolver.js';
import { getTickers } from './stock-data/tickers.js';
import { getHistoricStockData } from './stock-data/historic-stock-data.js';
import { getBestDividends, getCheapStocks } from './stock-data/formulas.js';
import { getCurrentPrice } from './stock-data/quotes.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
export type YahooFinanceType = typeof yahooFinance;

app.whenReady().then(async () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
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
  ipcMainHandle('getCurrentPrice', (symbol) =>
    getCurrentPrice(symbol, yahooFinance, webContents));
  ipcMainHandle('getCheapStocks', (stooqStartDate: string, count: number) =>
    getCheapStocks(stooqStartDate, count, webContents, yahooFinance));
  ipcMainHandle('getBestDividends', (count) =>
    getBestDividends(count, webContents, yahooFinance));

  const quote = await yahooFinance.quote('PKN.WA');
  console.log(quote);

  mainWindow.on('closed', () => {
    app.quit();
  });
});