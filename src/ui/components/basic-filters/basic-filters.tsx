import { BestDividends } from '../best-dividends';
import { CheapStocks } from '../cheap-stocks';
import { basicFilterTabId } from '../filter-tabs';
import { basicFilters } from './basic-filters.module.scss';

export const basicFilterPanelId = 'panel-basic';

interface BasicFiltersProps {
  cheapStocksEnabled: boolean
  toggleCheapStocks: (enabled: boolean) => void
  stooqStartDate: string
  setCheapStocks: (cheapStocks: CheapStocks) => void
  setSymbol: (symbol: string) => void
  hasCheapStocksWarning: boolean
  bestDividendsEnabled: boolean
  toggleBestDividends: (enabled: boolean) => void
  setBestDividends: (bestDividends: BestDividends) => void
  areBestDividendsStale: boolean
}

export const BasicFilters = ({
  cheapStocksEnabled, toggleCheapStocks, stooqStartDate,
  setCheapStocks, setSymbol, hasCheapStocksWarning, bestDividendsEnabled,
  toggleBestDividends, setBestDividends, areBestDividendsStale
}: BasicFiltersProps) =>
(
  <section
    role='tabpanel'
    id={basicFilterPanelId}
    aria-labelledby={basicFilterTabId}
    className={basicFilters}
  >
    <CheapStocks
      enabled={cheapStocksEnabled}
      setEnabled={toggleCheapStocks}
      stooqStartDate={stooqStartDate}
      setCheapStocks={setCheapStocks}
      setSymbol={setSymbol}
      hasCheapStocksWarning={hasCheapStocksWarning}
    />
    <BestDividends
      enabled={bestDividendsEnabled}
      setEnabled={toggleBestDividends}
      setBestDividends={setBestDividends}
      setSymbol={setSymbol}
      areBestDividendsStale={areBestDividendsStale}
    />
  </section>
);