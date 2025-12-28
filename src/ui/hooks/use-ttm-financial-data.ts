import { useEffect, useState } from 'react';

export function useTtmFinancialData(symbol: string) {
  const [financialData, setFinancialData] = useState<TtmFinancialData>();

  useEffect(() => {
    (async () => setFinancialData(await window.electron.getTtmFinancialData(symbol)))();
  }, [symbol]);

  return financialData;
}