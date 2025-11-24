import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';

import {
  Combobox, Select, Slider, Switch
} from '../../design-system';
import { useTickers, useCompanyStockData, useCurrentPrice } from '../../hooks';
import { CandleChart } from '../candle-chart/candle-chart';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import {
  avgPriceContainer,
  cheapStockController,
  cheapStockControllerLegend,
  cheapStockSliderWrapper,
  currPriceContainer,
  functionsCard, mainFrame, mainFrameControls, pricesContainer, tickerCard
} from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';
import { getAvgPrice, getTickersSelectOptions, periodSelectOptions } from './main-frame.utils';
import { formatPrice } from '../../utils/currency';

export const MainFrame = () => {
  const tickers = useTickers();
  const [symbol, setSymbol] = useState('PKN');
  const [period, setPeriod] = useState('30');
  const stooqStartDate = convertNativeDateToStooqDate(subDays(new Date(), Number(period)));
  const companyStockData = useCompanyStockData(symbol, stooqStartDate);
  const currentPrice = useCurrentPrice(symbol);
  const [cheapStocksCountArr, setCheapStocksCountArr] = useState([0]);
  const cheapStocksCount = cheapStocksCountArr[0];
  const [cheapStocksEnabled, setCheapStocksEnabled] = useState(false);
  const [cheapStocks, setCheapStocks] = useState<CheapStock[]>();
  const [cheapStocksLoading, setCheapStocksLoading] = useState(false);

  const tickerSelectOptions = useMemo(() => (cheapStocksEnabled
    ? getTickersSelectOptions(cheapStocks)
    : getTickersSelectOptions(tickers)),
    [cheapStocks, cheapStocksEnabled, tickers]
  );

  const findCheapStockLegend = cheapStocksCount === 0
    ? 'Find cheap stocks - off'
    : `Find ${cheapStocksCount} cheap stocks`;

  async function handleCheapStocksToggle(checked: boolean) {
    if (checked === true) {
      setCheapStocksLoading(true);

      try {
        const cheapStocksData = await window.electron.getCheapStocks(stooqStartDate, cheapStocksCount);
        if (cheapStocksData === undefined) throw new Error('dupa'); //TODO

        setCheapStocks(cheapStocksData);
        setSymbol(cheapStocksData[0].symbol);
        setCheapStocksEnabled(checked);
      } catch (err) {
        console.log(err); //TODO
      } finally {
        setCheapStocksLoading(false);
      }
    } else {
      setCheapStocksEnabled(false);
    }
  }

  function handleCheapStocksSlide(count: number[]) {
    if (cheapStocksEnabled) setCheapStocksEnabled(false);
    setCheapStocksCountArr(count);
  }

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
        <fieldset className={cheapStockController}>
          <legend className={cheapStockControllerLegend}>{findCheapStockLegend}</legend>
          <div className={cheapStockSliderWrapper}>
            <Slider
              value={cheapStocksCountArr}
              onValueChange={handleCheapStocksSlide}
              defaultValue={[0]}
              max={20}
              aria='Discount list length'
            />
          </div>
          <Switch
            checked={cheapStocksEnabled}
            onCheckedChange={handleCheapStocksToggle}
            disabled={cheapStocksCount === 0}
            loading={cheapStocksLoading}
          />
        </fieldset>
      </aside>
    </main>
  );
}; 