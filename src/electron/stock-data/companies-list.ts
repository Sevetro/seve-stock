import fs from 'fs';
import path from 'path';
import { differenceInDays } from 'date-fns';

import { companiesListFilename, dataCacheDirname } from './constants.js';
import { CompaniesListCache } from './types.js';
import { timestampParser } from './utils.js';
import { staleCompaniesListDays } from './config.js';

const companyDataRegex = /data-rowkey="GPW:([A-Z]+)[\s\S]*?https:\/\/s3-symbol-logo\.tradingview\.com\/([^.]+)[\s\S]*?title="(?:[^"]*−\s*)?([^"]+)"/g;
const redundantSuffixRegex = /\(?\b(?:Sp[oó]lka\s+Akcyjna|S\s*\.?\s*A\.?)\b\.?\)?/gi;
const pageWithCompaniesList = 'https://pl.tradingview.com/markets/stocks-poland/market-movers-large-cap/';

async function scrapCompanies() {
  try {
    const res = await fetch(pageWithCompaniesList);
    const html = await res.text();
    const matchedData = [...html.matchAll(companyDataRegex)];

    const companiesList = matchedData.map(m => ({
      ticker: m[1],
      company: m[2],
      fullname: m[3].replace(redundantSuffixRegex, '').trim()
    }));
    const today = new Date();
    const companiesWithSymbolsWithTimestamp = {
      timestamp: today,
      companiesList
    };

    const filePath = path.join(dataCacheDirname, companiesListFilename);
    fs.mkdirSync(dataCacheDirname, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(companiesWithSymbolsWithTimestamp, null, 2));

    return companiesList;

  } catch (err) {
    console.error('[ERROR]:[scrapCompanies]', err);
  }
}

export async function getFreshCompaniesList() {
  const filePath = path.join(dataCacheDirname, companiesListFilename);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: CompaniesListCache = JSON.parse(rawData, timestampParser);
    const { timestamp, companiesList } = parsedData;

    if (companiesList.length === 0) throw new Error('Empty cache file');

    const daysSinceUpdate = differenceInDays(new Date(), timestamp);

    if (daysSinceUpdate >= staleCompaniesListDays) {
      console.log('[LOG]:[getFreshCompaniesList] Companies list is stale, trying to scrap...');
      const scrappedCompaniesList = await scrapCompanies();

      if (scrappedCompaniesList === undefined || scrappedCompaniesList.length === 0) {
        console.error('[ERROR]:[getFreshCompaniesList] Unable to scrap fresh companies, using stale data from cache');
        return companiesList;
      } else {
        return scrappedCompaniesList;
      }

    } else {
      return companiesList;
    }

  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      console.log('[LOG]:[getFreshCompaniesList] No companies list cache file found, trying to scrap...');
      return await scrapCompanies();
    } else if (err instanceof Error && err.message === 'Empty cache file') {
      console.log('[ERROR]:[getFreshStockData] Companies list cache file is empty, trying to scrap...');
      return await scrapCompanies();
    }
    else {
      console.error('[ERROR]:[getFreshCompaniesList]', err);
    }
  }
}