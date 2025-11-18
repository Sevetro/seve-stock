import { WebContents } from 'electron';
import { getFreshStockData } from './stock-data.js';
import { PreparedData } from './types.js';

export async function prepareData(stooqDate: string, companiesList: CompaniesList | undefined, webContents: WebContents) {
  if (companiesList === undefined) {
    console.error('[ERROR]:[prepareData] Companies list is undefined.');
    return;
  }

  const preparedData: PreparedData = {};

  for (const { ticker, company, fullname } of companiesList) {
    const stockData = await getFreshStockData(ticker, stooqDate, webContents) ?? [];
    preparedData[ticker] = { company, fullname, stockData };
  }

  return preparedData;
}