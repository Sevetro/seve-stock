import { WebContents } from 'electron';

import { getErrorMsg } from './error.js';
import { webContentsSend } from './core.js';
import { serializeMsg } from '../shared-with-ui/message.js';

function printMsg({ msg, source, type }: Message) {
  console.log(serializeMsg({ msg, source, type }));
}

function sendMessage(webContents: WebContents, msg: Message) {
  webContentsSend(webContents, 'message', msg);
}

export function printAndSendMsg(webContents: WebContents, { msg, source, type }: Message) {
  if (type === 'log') printMsg({ type: 'log', source, msg });
  else if (type === 'error') printMsg({ type: 'error', source, msg });
  sendMessage(webContents, { msg, source, type });
}

export function printAndSendLog(webContents: WebContents, source: string, log: string) {
  printMsg({ msg: log, source, type: 'log' });
  sendMessage(webContents, { msg: log, source, type: 'log' });
}

export function printAndSendError(webContents: WebContents, source: string, err: unknown) {
  printMsg({ msg: getErrorMsg(err), source, type: 'error' });
  sendMessage(webContents, { msg: getErrorMsg(err), source, type: 'error' });
}