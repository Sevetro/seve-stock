import { useEffect, useState } from 'react';

export function useCompaniesList() {
  const [companiesList, setCompaniesList] = useState<Tickers>();

  useEffect(() => {
    (async () => setCompaniesList(await window.electron.getTickers()))();
  }, []);

  return companiesList;
}