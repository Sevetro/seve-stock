import { useEffect, useState } from 'react';
import { Toast as RadixToast } from 'radix-ui';

import './App.css';
import { MainFrame } from './components/main-frame';
import { serializeMsg } from '../electron/shared-with-ui/message';
import { isInvalidCheapStocksError, isStaleBestDividendsError, isStaleStockDataUsageMessage } from './utils/messages';
import { Toast } from './design-system';

export default function App() {
  const [isUsingStaleHistoricData, setIsUsingStaleHistoricData] = useState(false);
  const [areCheapStocksInvalid, setAreCheapStocksInvalid] = useState(false);
  const [areBestDividendsStale, setAreBestDividendsStale] = useState(false);

  useEffect(() => {
    const unsub = window.electron.subscribeToMessages(message => {
      console.log(serializeMsg(message));
      if (isStaleStockDataUsageMessage(message) && !isUsingStaleHistoricData) setIsUsingStaleHistoricData(true);
      if (isInvalidCheapStocksError(message) && !areCheapStocksInvalid) setAreCheapStocksInvalid(true);
      if (isStaleBestDividendsError(message) && !areBestDividendsStale) setAreBestDividendsStale(true);
    });
    return unsub;
  }, [areBestDividendsStale, areCheapStocksInvalid, isUsingStaleHistoricData]);

  return (
    <RadixToast.Provider>
      <MainFrame
        hasCheapStocksWarning={areCheapStocksInvalid}
        areBestDividendsStale={areBestDividendsStale}
      />

      <RadixToast.Viewport className="toastViewport" />
      <Toast
        open={isUsingStaleHistoricData}
        onOpenChange={setIsUsingStaleHistoricData}
        title='Stale data'
        description="Couldn't fetch fresh historic data, using stale data from cache. For more info check logs."
      />
    </RadixToast.Provider>
  );
}