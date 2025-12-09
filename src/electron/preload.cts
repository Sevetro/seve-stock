import { contextBridge, ipcRenderer } from "electron";

// this happens in UI

contextBridge.exposeInMainWorld("electron", {
  getTickers: async () => ipcRendererInvoke('getTickers'),
  getCompanyStockData: async (symbol, stooqStartDate) => ipcRendererInvoke('getCompanyStockData', symbol, stooqStartDate),
  getCurrentPrice: async (symbol) => ipcRendererInvoke('getCurrentPrice', symbol),
  getCheapStocks: async (stooqStartDate, count) => ipcRendererInvoke('getCheapStocks', stooqStartDate, count),
  getBestDividends: async (count) => ipcRendererInvoke('getBestDividends', count),

  subscribeToMessages: (callback) => ipcRendererOn('message', msg => callback(msg))
} satisfies Window["electron"]);

function ipcRendererInvoke<Key extends keyof EventMap>(
  key: Key,
  ...args: EventMap[Key]['args']
): Promise<EventMap[Key]['payload']> {
  return ipcRenderer.invoke(key, ...args);
}

function ipcRendererOn<Key extends keyof EventMap>(
  key: Key,
  callback: (payload: EventMap[Key]['payload']) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  ipcRenderer.on(key, cb);
  return () => ipcRenderer.off(key, cb);
}
