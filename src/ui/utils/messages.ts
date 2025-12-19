import { errors, getErrorMsg } from '../../electron/shared-with-ui/errors';

function serializeUiMsg({ type, source, msg }: Message) {
  return `[UI]:[${type.toUpperCase()}]:[${source}] ${msg}`;
}

function printUiMsg(message: Message) {
  console.log(serializeUiMsg(message));
}

export function printUiError(source: string, err: unknown) {
  printUiMsg({ msg: getErrorMsg(err), source, type: 'error' });
}

export function isStaleStockDataUsageMessage({ msg, source, details }: Message) {
  return source === 'getHistoricStockData' &&
    details?.symbol !== undefined &&
    msg === errors.freshStockDataUnavailable(details.symbol);
}

export function isInvalidCheapStocksError({ msg, source, details }: Message) {
  return source === 'getCheapStocks' &&
    details?.symbol !== undefined &&
    (msg === errors.cantGetAvgPrice(details.symbol) ||
      msg === errors.cantGetCurrentPrice(details.symbol));
}

export function isStaleBestDividendsError({ msg, details }: Message) {
  return details?.symbol !== undefined &&
    msg === errors.freshQuoteUnavailable(details.symbol);
}