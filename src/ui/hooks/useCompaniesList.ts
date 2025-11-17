import { useEffect, useState } from 'react';

import { printMessages } from '../utils/messages';

export function useCompaniesList() {
  const [companiesList, setCompaniesList] = useState<CompaniesList>();

  useEffect(() => {
    (async () => {
      const { data, messages } = await window.electron.getCompaniesList();
      printMessages(messages);
      setCompaniesList(data);
    })();
  }, []);

  return companiesList;
}