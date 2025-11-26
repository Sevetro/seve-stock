import { WebContents } from 'electron';

import { webContentsSend } from './core.js';
import { getErrorMsg } from '../shared-with-ui/errors.js';
import { serializeMsg } from '../shared-with-ui/message.js';

function sendMessage(webContents: WebContents, message: Message) {
  webContentsSend(webContents, 'message', message);
}

function printMsg(message: Message) {
  console.log(serializeMsg(message));
}

export function printAndSendMsg(webContents: WebContents, message: Message) {
  const { msg, source, type } = message;
  if (type === 'log') printMsg({ type: 'log', source, msg });
  else if (type === 'error') printMsg({ type: 'error', source, msg });
  sendMessage(webContents, message);
}

export function printAndSendLog(webContents: WebContents, source: string, log: string) {
  printMsg({ msg: log, source, type: 'log' });
  sendMessage(webContents, { msg: log, source, type: 'log' });
}

// Use with Error object - if you want to use error as string, use printAndSendMsg()
export function printAndSendError(webContents: WebContents, source: string, err: unknown) {
  printMsg({ msg: getErrorMsg(err), source, type: 'error' });
  sendMessage(webContents, { msg: getErrorMsg(err), source, type: 'error' });
}