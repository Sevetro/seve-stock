import { errors } from '../shared-with-ui/errors.js';
import { getErrorMsg } from './error.js';

function serializeConsoleMsg(type: 'log' | 'error', msgFrom: string, msg: string) {
  return `[${type.toUpperCase()}]:[${msgFrom}] ${msg}`;
}
function consoleLog(source: string, log: string) {
  console.log(serializeConsoleMsg('log', source, log));
}
function consoleError(source: string, err: unknown) {
  console.error(serializeConsoleMsg('error', source, getErrorMsg(err)));
}
function addPayloadMsg(payload: Payload<any>, msg: string) {
  try {
    if (payload === undefined || msg === undefined) {
      throw new Error(errors.cantAddPayloadMsg);
    }

    if (payload.messages === undefined) payload.messages = [];
    payload.messages.push(msg);

  } catch (err) {
    consoleError(addPayloadMsg.name, err);
  }
}
function addPayloadLog(payload: Payload<any>, source: string, msg: string) {
  addPayloadMsg(payload, serializeConsoleMsg('log', source, msg));
}
function addPayloadError(payload: Payload<any>, source: string, msg: string) {
  addPayloadMsg(payload, serializeConsoleMsg('error', source, msg));
}

export function consoleErrorAndPayload(payload: Payload<any>, source: string, err: unknown) {
  consoleError(source, err);
  addPayloadError(payload, source, getErrorMsg(err));
}

export function consoleLogAndPayload(payload: Payload<any>, source: string, msg: string) {
  consoleLog(source, msg);
  addPayloadLog(payload, source, msg);
}