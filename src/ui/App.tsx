import { useEffect, useState } from 'react';
import { Toast as RadixToast } from 'radix-ui';

import './App.css';
import { MainFrame } from './components/main-frame';
import { serializeMsg } from '../electron/shared-with-ui/message';
import { isInvalidCheapStocksError, isStaleStockDataUsageMessage } from './utils/messages';
import { Toast } from './design-system';

export default function App() {
  const [areCheapStocksInvalid, setAreCheapStocksInvalid] = useState(false);
  const [isUsingStaleStockData, setIsUsingStaleStockData] = useState(false);

  useEffect(() => {
    const unsub = window.electron.subscribeToMessages(message => {
      console.log(serializeMsg(message));
      if (isInvalidCheapStocksError(message)) setAreCheapStocksInvalid(true);
      if (isStaleStockDataUsageMessage(message)) setIsUsingStaleStockData(true);
    });
    return unsub;
  }, []);

  return (
    <RadixToast.Provider>
      <MainFrame hasCheapStocksWarning={areCheapStocksInvalid} />

      <RadixToast.Viewport className="toastViewport" />
      <Toast
        open={isUsingStaleStockData}
        onOpenChange={setIsUsingStaleStockData}
        title='Stale data'
        description="Couldn't fetch fresh data, using stale data from cache. For more info check logs."
      />
    </RadixToast.Provider>
  );
}