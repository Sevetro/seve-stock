import { app, BrowserWindow } from 'electron';

import { ipcMainHandle, isDev } from './utils/core.js';
import { getPreloadPath, getUIPath } from './utils/path-resolver.js';
import { prepareData } from './stock-data/prepare-data.js';
import { getFreshCompaniesList } from './stock-data/companies-list.js';
import { getFreshStockData } from './stock-data/stock-data.js';
import { getAvgPrice } from './stock-data/formulas.js';

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
  ipcMainHandle('getCompaniesList', () => getFreshCompaniesList(webContents));
  ipcMainHandle('getCompanyStockData', (ticker, stooqStartDate) => getFreshStockData(ticker, stooqStartDate, webContents));
  ipcMainHandle('getAvgPrice', (ticker, stooqStartDate) => getAvgPrice(ticker, stooqStartDate, webContents));

  mainWindow.on('closed', () => {
    app.quit();
  });
});