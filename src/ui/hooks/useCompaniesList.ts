import { useEffect, useState } from 'react';

export function useCompaniesList() {
  const [companiesList, setCompaniesList] = useState<CompaniesList>();

  useEffect(() => {
    async function getCompaniesList() {
      setCompaniesList(await window.electron.getCompaniesList());
    }

    getCompaniesList();
  }, []);

  return companiesList;
}