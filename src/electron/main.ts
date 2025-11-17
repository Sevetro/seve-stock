import { app, BrowserWindow } from 'electron';

import { ipcMainHandle, isDev } from './utils/core.js';
import { getPreloadPath, getUIPath } from './utils/path-resolver.js';
import { prepareData } from './stock-data/prepare-data.js';
import { getFreshCompaniesList } from './stock-data/companies-list.js';
import { getFreshStockData } from './stock-data/stock-data.js';
import { convertStringDateToStooqDate } from './stock-data/utils.js';

async function getAvgPrice(ticker: string, stooqStartDate: string) {
  const companyStockData = await getFreshStockData(ticker, stooqStartDate);

  try {
    if (companyStockData === undefined) {
      throw new Error(`[ERROR]:[calculateCurrentPriceToAvgRatio] Stock data for ${ticker} is undefined.`);
    }
    if (companyStockData.length === 0) {
      throw new Error(`[ERROR]:[calculateCurrentPriceToAvgRatio] Stock data for ${ticker} is empty.`);
    }
    const earliestAvailableData = companyStockData[0].date;
    if (convertStringDateToStooqDate(earliestAvailableData) > stooqStartDate) {
      throw new Error(`[ERROR]:[calculateCurrentPriceToAvgRatio] Earliest available data for ${ticker} is ${earliestAvailableData}.`);
    }

    return companyStockData.reduce((acc, { avg }) => acc + avg, 0) / companyStockData.length;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('Earliest available data')) {
        console.error(err.message);
        return companyStockData!.reduce((acc, { avg }) => acc + avg, 0) / companyStockData!.length;
      } else {
        throw new Error(err.message);
      }
    }
  }
}

app.whenReady().then(async () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: getPreloadPath()
    }
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5132');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  mainWindow.webContents.openDevTools();

  ipcMainHandle('getCompaniesList', getFreshCompaniesList);
  ipcMainHandle('getCompanyStockData', getFreshStockData);
  ipcMainHandle('getAvgPrice', getAvgPrice);

  //TODO: subscribe to logs

  mainWindow.on('closed', () => {
    app.quit();
  });
});