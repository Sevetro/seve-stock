import { useEffect, useState } from 'react';

export function useQuote(symbol: string) {
  const [quote, setQuote] = useState<Quote>();

  useEffect(() => {
    (async () => setQuote(await window.electron.getQuote(symbol)))();
  }, [symbol]);

  return quote;
}