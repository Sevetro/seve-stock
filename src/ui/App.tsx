import { useEffect, useState } from 'react';

import './App.css';
import { MainFrame } from './components/main-frame';
import { serializeMsg } from '../electron/shared-with-ui/message';
import { isCheapStocksWarning } from './utils/messages';

export default function App() {
  const [hasCheapStocksWarning, setHasCheapStocksWarning] = useState(false);

  useEffect(() => {
    const unsub = window.electron.subscribeToMessages(message => {
      console.log(serializeMsg(message));
      if (isCheapStocksWarning(message)) setHasCheapStocksWarning(true);
    });
    return unsub;
  }, []);

  return (
    <MainFrame hasCheapStocksWarning={hasCheapStocksWarning} />
  );
}