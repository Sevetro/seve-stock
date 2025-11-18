import { contextBridge, ipcRenderer } from "electron";

// this happens in UI

contextBridge.exposeInMainWorld("electron", {
  getCompaniesList: async () => ipcRendererInvoke('getCompaniesList'),
  getCompanyStockData: async (ticker, stooqStartDate) => ipcRendererInvoke('getCompanyStockData', ticker, stooqStartDate),
  getAvgPrice: async (ticker, stooqStartDate) => ipcRendererInvoke('getAvgPrice', ticker, stooqStartDate),
  subscribeToMessages: (callback) => ipcRendererOn('message', msg => callback(msg))

} satisfies Window["electron"]);

function ipcRendererInvoke<Key extends keyof EventPayloadMap>(
  key: Key,
  ...args: any[]
): Promise<EventPayloadMap[Key]> {
  return ipcRenderer.invoke(key, ...args);
}

function ipcRendererOn<Key extends keyof EventPayloadMap>(
  key: Key,
  callback: (payload: EventPayloadMap[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  ipcRenderer.on(key, cb);
  return () => ipcRenderer.off(key, cb);
}
