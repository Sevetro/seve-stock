import { app, BrowserWindow } from 'electron';
import YahooFinance from 'yahoo-finance2';

import { ipcMainHandle, isDev } from './utils/core.js';
import { getPreloadPath, getUIPath } from './utils/path-resolver.js';
import { getTickers } from './stock-data/tickers.js';
import { getHistoricStockData } from './stock-data/historic-stock-data.js';
import { getDiscountList } from './stock-data/formulas.js';
import { getCurrentPrice } from './stock-data/current-price.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
export type YahooFinanceType = typeof yahooFinance;

app.whenReady().then(async () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
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
  ipcMainHandle('getTickers', () => getTickers(webContents, yahooFinance));
  ipcMainHandle('getCompanyStockData', (symbol, stooqStartDate) => getHistoricStockData(symbol, stooqStartDate, webContents));
  ipcMainHandle('getCurrentPrice', (symbol) => getCurrentPrice(symbol, yahooFinance, webContents));
  ipcMainHandle('getDiscountList', (stooqStartDate: string, count: number) => getDiscountList(stooqStartDate, count, webContents, yahooFinance));

  mainWindow.on('closed', () => {
    app.quit();
  });
});