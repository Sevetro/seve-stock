import { useEffect, useState } from 'react';

export function useCombinedInfo(symbol: string, startDate: Date) {
  const [extendedInfo, setCombinedInfo] = useState<CombinedInfo>();

  useEffect(() => {
    if (symbol !== '') (async () => setCombinedInfo(await window.electron.getCombinedInfo(symbol, startDate)))();
  }, [symbol, startDate]);

  return extendedInfo;
}