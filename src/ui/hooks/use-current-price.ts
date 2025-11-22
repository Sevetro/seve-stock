import { useEffect, useState } from 'react';

export function useCurrentPrice(symbol: string) {
  const [currentPrice, setCurrentPrice] = useState<number>();

  useEffect(() => {
    (async () => setCurrentPrice(await window.electron.getCurrentPrice(symbol)))();
  }, [symbol]);

  return currentPrice;
}