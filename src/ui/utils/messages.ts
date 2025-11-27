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

export function isInvalidCheapStocksError(message: Message) {
  return message.source === 'getCheapStocks' &&
    message.details?.symbol !== undefined &&
    (message.msg === errors.cantGetAvgPrice(message.details.symbol) ||
      message.msg === errors.cantGetCurrentPrice(message.details.symbol));
}

export function isStaleStockDataUsageMessage({ msg, source, details }: Message) {
  return source === 'getHistoricStockData' &&
    details?.symbol !== undefined &&
    msg === errors.freshStockDataUnavailable(details.symbol);
}