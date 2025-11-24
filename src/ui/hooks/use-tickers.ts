import { useEffect, useState } from 'react';

export function useTickers() {
  const [tickers, setTickers] = useState<Tickers>();

  useEffect(() => {
    (async () => setTickers(await window.electron.getTickers()))();
  }, []);

  return tickers;
}