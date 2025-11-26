import { errors, getErrorMsg } from '../../electron/shared-with-ui/errors';

export function isCheapStocksWarning(message: Message) {
  return message.source === 'getCheapStocks' &&
    message.details?.symbol !== undefined &&
    (message.msg === errors.cantGetAvgPrice(message.details.symbol) ||
      message.msg === errors.cantGetCurrentPrice(message.details.symbol));
}

function serializeUiMsg({ type, source, msg }: Message) {
  return `[UI]:[${type.toUpperCase()}]:[${source}] ${msg}`;
}

function printUiMsg(message: Message) {
  console.log(serializeUiMsg(message));
}

export function printUiError(source: string, err: unknown) {
  printUiMsg({ msg: getErrorMsg(err), source, type: 'error' });
}