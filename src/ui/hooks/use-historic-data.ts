import { useEffect, useState } from 'react';

export function useHistoricData(symbol: string, startDate: Date) {
  const [historicData, setHistoricData] = useState<HistoricData>();

  useEffect(() => {
    if (symbol === '') return;
    (async () => setHistoricData(await window.electron.getHistoricData(symbol, startDate)))();
  }, [symbol, startDate]);

  return historicData;
}