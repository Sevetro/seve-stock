import { ipcMain, WebFrameMain } from 'electron';
import { pathToFileURL } from 'url';
import { getUIPath } from './path-resolver.js';

export function isDev() {
  return process.env.NODE_ENV === 'dev';
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

// if there will be more windows, or some router, then this may need an update
export function validateEventFrame(frame: WebFrameMain) {
  if (isDev() && new URL(frame.url).host === 'localhost:5132') {
    return;
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error('Malicious event!');
  }
}

// export function ipcWebContentsSend<Key extends keyof EventPayloadMap>(
//   key: Key,
//   webContents: WebContents,
//   payload: EventPayloadMap[Key]
// ) {
//   webContents.send(key, payload);
// }