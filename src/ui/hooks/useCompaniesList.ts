import { useEffect, useState } from 'react';

export function useCompaniesList() {
  const [companiesList, setCompaniesList] = useState<CompaniesList>();

  useEffect(() => {
    (async () => setCompaniesList(await window.electron.getCompaniesList()))();
  }, []);

  return companiesList;
}