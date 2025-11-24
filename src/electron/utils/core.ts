import { ipcMain, WebContents, WebFrameMain } from 'electron';
import { pathToFileURL } from 'url';

import { getUIPath } from './path-resolver.js';

export function isDev() {
  return process.env.NODE_ENV === 'dev';
}

// if there will be more windows, or some router, then this may need an update
function validateEventFrame(frame: WebFrameMain) {
  if (isDev() && new URL(frame.url).host === 'localhost:5132') {
    return;
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error('Malicious event!');
  }
}

export function ipcMainHandle<Key extends keyof EventMap>(
  key: Key,
  handler: (...args: EventMap[Key]['args']) => EventMap[Key]['payload']
) {
  ipcMain.handle(key, (event, ...args: EventMap[Key]['args']) => {
    const senderFrame = event.senderFrame;

    if (senderFrame === null) {
      throw new Error('senderFrame has been destroyed or navigated');
    }

    validateEventFrame(senderFrame);
    return handler(...args);
  });
}

export function webContentsSend<Key extends keyof EventMap>(
  webContents: WebContents,
  key: Key,
  payload: EventMap[Key]['payload']
) {
  webContents.send(key, payload);
}