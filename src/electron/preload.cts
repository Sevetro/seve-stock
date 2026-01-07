import { contextBridge, ipcRenderer } from "electron";

// this happens in UI

contextBridge.exposeInMainWorld("electron", {
  getTickers: async () =>
    ipcRendererInvoke('getTickers'),
  getHistoricData: async (symbol, startDate) =>
    ipcRendererInvoke('getHistoricData', symbol, startDate),
  getCombinedInfo: async (symbol, startDate) =>
    ipcRendererInvoke('getCombinedInfo', symbol, startDate),
  getCheapStocks: async (startDate, count) =>
    ipcRendererInvoke('getCheapStocks', startDate, count),
  getBestDividends: async (count) =>
    ipcRendererInvoke('getBestDividends', count),
  getBiggestGaps: async (startDate, count) =>
    ipcRendererInvoke('getBiggestGaps', startDate, count),
  getAdvancedFiltersResult: async (advancedFilters, startDate) =>
    ipcRendererInvoke('getAdvancedFiltersResult', advancedFilters, startDate),

  subscribeToMessages: (callback) =>
    ipcRendererOn('message', msg => callback(msg))
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
