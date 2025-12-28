import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';

import { Combobox, Select } from '../../design-system';
import { useTickers, useCompanyStockData, useQuote } from '../../hooks';
import { CandleChart } from '../candle-chart/candle-chart';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import {
  functionsCard, leftAside, mainFrame, mainFrameControls, tickerCard
} from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';
import { getTickersSelectOptions, periodSelectOptions } from './main-frame.utils';
import { CheapStocks } from '../cheap-stocks';
import { BestDividends } from '../best-dividends';
import { useTtmFinancialData } from '../../hooks/use-ttm-financial-data';
import { InfoCard } from '../info-card';

interface MainFrameProps {
  hasCheapStocksWarning: boolean
  areBestDividendsStale: boolean
}

export const MainFrame = ({ hasCheapStocksWarning, areBestDividendsStale }: MainFrameProps) => {
  const tickers = useTickers();
  const [symbol, setSymbol] = useState('PKN');
  const [period, setPeriod] = useState('30');
  const stooqStartDate = convertNativeDateToStooqDate(subDays(new Date(), Number(period)));
  const companyStockData = useCompanyStockData(symbol, stooqStartDate);
  const quote = useQuote(symbol);
  const ttmFinancialData = useTtmFinancialData(symbol);

  const [cheapStocks, setCheapStocks] = useState<CheapStocks>();
  const [cheapStocksEnabled, setCheapStocksEnabled] = useState(false);
  const [bestDividends, setBestDividends] = useState<BestDividends>();
  const [bestDividendsEnabled, setBestDividendsEnabled] = useState(false);

  const tickerSelectOptions = useMemo(() => (
    cheapStocksEnabled
      ? getTickersSelectOptions(cheapStocks)
      : bestDividendsEnabled
        ? getTickersSelectOptions(bestDividends)
        : getTickersSelectOptions(tickers)),
    [bestDividends, bestDividendsEnabled, cheapStocks, cheapStocksEnabled, tickers]
  );

  function handlePeriodChange(value: string) {
    if (cheapStocksEnabled) setCheapStocksEnabled(false);
    setPeriod(value);
  }

  function handleCheapStocksToggle(enable: boolean) {
    if (enable && bestDividendsEnabled) setBestDividendsEnabled(false);
    setCheapStocksEnabled(enable);
  }

  function handleBestDividendsToggle(enable: boolean) {
    if (enable && cheapStocksEnabled) setCheapStocksEnabled(false);
    setBestDividendsEnabled(enable);
  }

  return (
    <main className={mainFrame}>
      <aside className={leftAside}>
        <InfoCard
          symbol={symbol}
          quote={quote}
          companyStockData={companyStockData}
          ttmFinancialData={ttmFinancialData}
        />
      </aside>

      <section className={tickerCard}>
        <header className={mainFrameControls}>
          <Combobox
            placeholder='Ticker'
            options={tickerSelectOptions}
            value={symbol}
            setValue={setSymbol}
            searchPlaceholder='Search ticker...'
            width={150}
          />
          <Select
            placeholder='Period'
            options={periodSelectOptions}
            value={period}
            onValueChange={handlePeriodChange}
            width={100}
          />
        </header>

        {<CandleChart data={createCandlestickData(companyStockData ?? [])} />}
      </section>

      <aside className={functionsCard}>
        <CheapStocks
          enabled={cheapStocksEnabled}
          setEnabled={handleCheapStocksToggle}
          stooqStartDate={stooqStartDate}
          setCheapStocks={setCheapStocks}
          setSymbol={setSymbol}
          hasCheapStocksWarning={hasCheapStocksWarning}
        />
        <BestDividends
          enabled={bestDividendsEnabled}
          setEnabled={handleBestDividendsToggle}
          setBestDividends={setBestDividends}
          setSymbol={setSymbol}
          areBestDividendsStale={areBestDividendsStale}
        />
      </aside>
    </main>
  );
}; 