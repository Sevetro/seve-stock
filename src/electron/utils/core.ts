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

export function ipcMainHandle<Key extends keyof EventPayloadMap>(
  key: Key,
  handler: (...args: any[]) => EventPayloadMap[Key]
) {
  ipcMain.handle(key, (event, ...args) => {
    const senderFrame = event.senderFrame;

    if (senderFrame === null) {
      throw new Error('senderFrame has been destroyed or navigated');
    }

    validateEventFrame(senderFrame);
    return handler(...args);
  });
}

export function webContentsSend<Key extends keyof EventPayloadMap>(
  webContents: WebContents,
  key: Key,
  payload: EventPayloadMap[Key]
) {
  webContents.send(key, payload);
}