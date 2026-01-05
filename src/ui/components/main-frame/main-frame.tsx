import { useState } from 'react';
import { subDays } from 'date-fns';

import { Combobox, Select } from '../../design-system';
import { useTickers, useCompanyStockData } from '../../hooks';
import { CandleChart } from '../candle-chart/candle-chart';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import {
  filtersCard, leftAside, mainFrame, mainFrameControls, tickerCard
} from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';
import { getTickersSelectOptions, periodSelectOptions } from './main-frame.utils';
import { InfoCard } from '../info-card';
import { BasicFilters } from '../basic-filters';
import { AdvancedFilters } from '../advanced-filters';
import { FilterTabs, type FilterTab } from '../filter-tabs';

type StockModule = 'cheapStocks' | 'bestDividends' | 'advancedFilters'

interface MainFrameProps {
  hasCheapStocksWarning: boolean
  areBestDividendsStale: boolean
}

export const MainFrame = ({
  hasCheapStocksWarning, areBestDividendsStale
}: MainFrameProps) => {
  const allTickers = useTickers();
  const [symbol, setSymbol] = useState('');
  const [period, setPeriod] = useState('30');
  const stooqStartDate = convertNativeDateToStooqDate(subDays(new Date(), Number(period)));
  const companyStockData = useCompanyStockData(symbol, stooqStartDate);

  const [activeFiltersTab, setActiveFiltersTab] = useState<FilterTab>('basic');
  const [enabledModule, setEnabledModule] = useState<StockModule>();
  const [cheapStocks, setCheapStocks] = useState<CheapStocks>();
  const [bestDividends, setBestDividends] = useState<BestDividends>();
  const [advancedFiltersTickers, setAdvancedFiltersTickers] = useState<Tickers>();

  let currentTickers: Tickers | undefined;

  switch (enabledModule) {
    case 'cheapStocks':
      currentTickers = cheapStocks;
      break;
    case 'bestDividends':
      currentTickers = bestDividends;
      break;
    case 'advancedFilters':
      currentTickers = advancedFiltersTickers;
      break;
    default:
      currentTickers = allTickers;
  }

  const tickerSelectOptions = getTickersSelectOptions(currentTickers);

  function handlePeriodChange(value: string) {
    if (enabledModule === 'cheapStocks') setEnabledModule(undefined);
    setPeriod(value);
  }

  function changeFiltersTab(tab: FilterTab) {
    setEnabledModule(undefined);
    setActiveFiltersTab(tab);
  }

  function toggleCheapStocks(enable: boolean) {
    setEnabledModule(enable ? 'cheapStocks' : undefined);
  }

  function toggleBestDividends(enable: boolean) {
    setEnabledModule(enable ? 'bestDividends' : undefined);
  }

  function toggleAdvancedFilters(enable: boolean) {
    setEnabledModule(enable ? 'advancedFilters' : undefined);
  }

  return (
    <main className={mainFrame}>
      <aside className={leftAside}>
        <InfoCard
          symbol={symbol}
          stooqStartDate={stooqStartDate}
        />
      </aside>

      <section className={tickerCard}>
        <header className={mainFrameControls}>
          <Combobox
            placeholder='Select ticker...'
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

        {symbol !== '' && <CandleChart data={createCandlestickData(companyStockData ?? [])} />}
      </section>

      <aside className={filtersCard}>
        <FilterTabs
          advancedFiltersEnabled={enabledModule === 'advancedFilters'}
          activeFiltersTab={activeFiltersTab}
          changeFiltersTab={changeFiltersTab}
        />

        {activeFiltersTab === 'basic' ?
          <BasicFilters
            areBestDividendsStale={areBestDividendsStale}
            bestDividendsEnabled={enabledModule === 'bestDividends'}
            cheapStocksEnabled={enabledModule === 'cheapStocks'}
            toggleBestDividends={toggleBestDividends}
            toggleCheapStocks={toggleCheapStocks}
            hasCheapStocksWarning={hasCheapStocksWarning}
            setBestDividends={setBestDividends}
            setCheapStocks={setCheapStocks}
            setSymbol={setSymbol}
            stooqStartDate={stooqStartDate}
          /> :
          <AdvancedFilters
            advancedFiltersEnabled={enabledModule === 'advancedFilters'}
            toggleAdvancedFilters={toggleAdvancedFilters}
            setAdvancedFiltersTickers={setAdvancedFiltersTickers}
            setSymbol={setSymbol}
            stooqStartDate={stooqStartDate}
          />
        }
      </aside>
    </main>
  );
}; 