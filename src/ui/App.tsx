import { useEffect } from 'react';

import './App.css';
import { MainFrame } from './components/main-frame';
import { serializeMsg } from '../electron/shared-with-ui/message';

export default function App() {
  useEffect(() => {
    const unsub = window.electron.subscribeToMessages(msg => console.log(serializeMsg(msg)));
    return unsub;
  }, []);

  return (
    <MainFrame />
  );
}