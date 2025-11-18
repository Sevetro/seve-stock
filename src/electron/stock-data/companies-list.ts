import fs from 'fs';
import path from 'path';
import { differenceInDays } from 'date-fns';
import { WebContents } from 'electron';

import { dataCacheDirname } from './constants.js';
import { CompaniesListCache } from './types.js';
import { timestampParser } from './utils.js';
import { staleCompaniesListDays } from './config.js';
import { errors } from '../shared-with-ui/errors.js';
import { printAndSendError, printAndSendLog, printAndSendMsg } from '../utils/message.js';
import { getErrorMsg, isError } from '../utils/error.js';
import { logs } from '../shared-with-ui/logs.js';

const companiesListCachePath = path.join(dataCacheDirname, 'companies-list.json');
const companyDataRegex = /data-rowkey="GPW:([A-Z]+)[\s\S]*?https:\/\/s3-symbol-logo\.tradingview\.com\/([^.]+)[\s\S]*?title="(?:[^"]*−\s*)?([^"]+)"/g;
const redundantSuffixRegex = /\(?\b(?:Sp[oó]lka\s+Akcyjna|S\s*\.?\s*A\.?)\b\.?\)?/gi;
const pageWithCompaniesList = 'https://pl.tradingview.com/markets/stocks-poland/market-movers-large-cap/';

async function scrapCompanies(webContents: WebContents) {
  try {
    const res = await fetch(pageWithCompaniesList);
    const html = await res.text();
    const matchedData = [...html.matchAll(companyDataRegex)];

    if (matchedData.length === 0) throw new Error(errors.cantScrap);

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

    fs.mkdirSync(dataCacheDirname, { recursive: true });
    fs.writeFileSync(companiesListCachePath, JSON.stringify(companiesWithSymbolsWithTimestamp, null, 2));

    return companiesList;

  } catch (err) {
    printAndSendError(webContents, scrapCompanies.name, err);
  }
}

export async function getFreshCompaniesList(webContents: WebContents) {

  try {
    const rawData = fs.readFileSync(companiesListCachePath, 'utf-8');
    const parsedData: CompaniesListCache = JSON.parse(rawData, timestampParser);
    const { timestamp, companiesList } = parsedData;

    if (companiesList.length === 0) throw new Error(errors.companiesListCacheEmpty);

    const daysSinceUpdate = differenceInDays(new Date(), timestamp);

    if (daysSinceUpdate >= staleCompaniesListDays) {
      printAndSendLog(webContents, getFreshCompaniesList.name, logs.companiesListStale);
      const freshCompaniesList = await scrapCompanies(webContents);

      if (freshCompaniesList === undefined || freshCompaniesList.length === 0) {
        printAndSendMsg(webContents, { msg: errors.usingStaleCompaniesList, source: getFreshCompaniesList.name, type: 'error' });
        return companiesList;
      } else {
        return freshCompaniesList;
      }

    } else {
      return companiesList;
    }

  } catch (err) {
    if (isError(err) && 'code' in err && err.code === 'ENOENT') {
      printAndSendLog(webContents, getFreshCompaniesList.name, logs.companiesListCacheMissing);
      return await scrapCompanies(webContents);
    } else if (getErrorMsg(err) === errors.companiesListCacheEmpty) {
      printAndSendError(webContents, getFreshCompaniesList.name, err);
      return await scrapCompanies(webContents);
    }
    else {
      printAndSendError(webContents, getFreshCompaniesList.name, err);
    }
  }
}