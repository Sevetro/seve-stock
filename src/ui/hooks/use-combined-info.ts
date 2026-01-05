import { useEffect, useState } from 'react';

export function useCombinedInfo(symbol: string, stooqStartDate: string) {
  const [extendedInfo, setCombinedInfo] = useState<CombinedInfo>();

  useEffect(() => {
    if (symbol !== '') (async () => setCombinedInfo(await window.electron.getCombinedInfo(symbol, stooqStartDate)))();
  }, [symbol, stooqStartDate]);

  return extendedInfo;
}