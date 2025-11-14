import { useEffect, useState } from 'react';

export function useCompanyStockData(ticker: string, stooqStartDate: string) {
  const [companyStockData, setCompanyStockData] = useState<CompanyStockData>();

  useEffect(() => {
    if (ticker == null || ticker === '' || stooqStartDate == null || stooqStartDate === '') return;
    (async () => setCompanyStockData(await window.electron.getCompanyStockData(ticker, stooqStartDate)))();
  }, [ticker, stooqStartDate]);

  return companyStockData;
}