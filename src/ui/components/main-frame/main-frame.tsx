import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';

import { Combobox, Select } from '../../design-system';
import { useTickers, useCompanyStockData, useCurrentPrice } from '../../hooks';
import { CandleChart } from '../candle-chart/candle-chart';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import {
  avgPriceContainer, currPriceContainer, functionsCard, mainFrame, mainFrameControls, pricesContainer, tickerCard
} from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';
import { getAvgPrice, getTickersSelectOptions, periodSelectOptions } from './main-frame.utils';
import { formatPrice } from '../../utils/currency';
import { CheapStocks } from '../cheap-stocks';

interface MainFrameProps {
  hasCheapStocksWarning: boolean
}

export const MainFrame = ({ hasCheapStocksWarning }: MainFrameProps) => {
  const tickers = useTickers();
  const [symbol, setSymbol] = useState('PKN');
  const [period, setPeriod] = useState('30');
  const stooqStartDate = convertNativeDateToStooqDate(subDays(new Date(), Number(period)));
  const companyStockData = useCompanyStockData(symbol, stooqStartDate);
  const currentPrice = useCurrentPrice(symbol);
  const [cheapStocks, setCheapStocks] = useState<CheapStocks>();
  const [cheapStocksEnabled, setCheapStocksEnabled] = useState(false);

  const tickerSelectOptions = useMemo(() => (cheapStocksEnabled
    ? getTickersSelectOptions(cheapStocks)
    : getTickersSelectOptions(tickers)),
    [cheapStocks, cheapStocksEnabled, tickers]
  );

  function handlePeriodChange(value: string) {
    if (cheapStocksEnabled) setCheapStocksEnabled(false);
    setPeriod(value);
  }

  return (
    <main className={mainFrame}>
      <section className={tickerCard}>
        <header className={mainFrameControls}>
          <Combobox
            placeholder='Ticker'
            options={tickerSelectOptions}
            value={symbol}
            setValue={setSymbol}
            searchPlaceholder='Search ticker...'
            width={100}
          />
          <Select
            placeholder='Period'
            options={periodSelectOptions}
            value={period}
            onValueChange={handlePeriodChange}
            width={100}
          />
          <output className={pricesContainer}>
            <span className={currPriceContainer}>curr: {formatPrice(currentPrice)}</span>
            <span className={avgPriceContainer}>avg: {formatPrice(getAvgPrice(companyStockData))}</span>
          </output>
        </header>

        {symbol !== '' && <CandleChart data={createCandlestickData(companyStockData ?? [])} />}
      </section>

      <aside className={functionsCard}>
        <CheapStocks
          enabled={cheapStocksEnabled}
          setEnabled={setCheapStocksEnabled}
          stooqStartDate={stooqStartDate}
          setCheapStocks={setCheapStocks}
          setSymbol={setSymbol}
          hasCheapStocksWarning={hasCheapStocksWarning}
        />
      </aside>
    </main>
  );
}; 