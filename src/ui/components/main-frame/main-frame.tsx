import { useState } from 'react';
import { subDays } from 'date-fns';

import { Combobox, Select } from '../../design-system';
import { useCompaniesList, useCompanyStockData, useCurrentPrice } from '../../hooks';
import { CandleChart } from '../candle-chart/candle-chart';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import {
  avgPriceContainer,
  currPriceContainer,
  functionsCard, mainFrame, mainFrameControls, pricesContainer, tickerCard
} from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';
import { getAvgPrice, getTickersSelectOptions, periodSelectOptions } from './main-frame.utils';
import { formatPrice } from '../../utils/currency';

export const MainFrame = () => {
  const companiesList = useCompaniesList();
  const [symbol, setSymbol] = useState('PKN');
  const [period, setPeriod] = useState('30');
  const stooqStartDate = convertNativeDateToStooqDate(subDays(new Date(), Number(period)));
  const companyStockData = useCompanyStockData(symbol, stooqStartDate);
  const currentPrice = useCurrentPrice(symbol);
  const [discountList, setDiscountList] = useState<StockDiscount[]>();

  async function getDiscountList() {
    setDiscountList(await window.electron.getDiscountList(stooqStartDate, 10));
  }

  return (
    <main className={mainFrame}>
      <section className={tickerCard}>
        <header className={mainFrameControls}>
          <Combobox
            placeholder='Ticker'
            options={getTickersSelectOptions(companiesList)}
            value={symbol}
            setValue={setSymbol}
            searchPlaceholder='Search ticker...'
            width={100}
          />

          <Select
            placeholder='Period'
            options={periodSelectOptions}
            setValue={setPeriod}
            value={period}
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

        <button onClick={getDiscountList}>find best discount</button>
        <div>
          {discountList?.map(stockDiscount => (
            <div>
              <span>{stockDiscount.symbol}</span>
              <span>{stockDiscount.discount}</span>
            </div>
          ))}
        </div>
      </aside>

    </main>
  );
}; 