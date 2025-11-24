import { useEffect, useState } from 'react';

export function useCompanyStockData(symbol: string, stooqStartDate: string) {
  const [companyStockData, setCompanyStockData] = useState<CompanyStockData>();

  useEffect(() => {
    if (symbol == null || symbol === '' || stooqStartDate == null || stooqStartDate === '') return;
    (async () => setCompanyStockData(await window.electron.getCompanyStockData(symbol, stooqStartDate)))();
  }, [symbol, stooqStartDate]);

  return companyStockData;
}