import { BestDividends } from '../best-dividends';
import { BiggestGaps } from '../biggest-gaps';
import { CheapStocks } from '../cheap-stocks';
import { basicFilterTabId } from '../filter-tabs';
import { basicFilters } from './basic-filters.module.scss';

export const basicFilterPanelId = 'panel-basic';

interface BasicFiltersProps {
  cheapStocksEnabled: boolean
  toggleCheapStocks: (enabled: boolean) => void
  startDate: Date
  setCheapStocks: (cheapStocks: CheapStocks) => void
  setSymbol: (symbol: string) => void
  hasCheapStocksWarning: boolean
  bestDividendsEnabled: boolean
  toggleBestDividends: (enabled: boolean) => void
  setBestDividends: (bestDividends: BestDividends) => void
  areBestDividendsStale: boolean
  biggestGapsEnabled: boolean
  toggleBiggestGaps: (enabled: boolean) => void
  setBiggestGaps: (biggestGaps: BiggestGaps) => void
}

export const BasicFilters = ({
  startDate, setSymbol,
  cheapStocksEnabled, toggleCheapStocks, setCheapStocks, hasCheapStocksWarning,
  bestDividendsEnabled, toggleBestDividends, setBestDividends, areBestDividendsStale,
  biggestGapsEnabled, toggleBiggestGaps, setBiggestGaps

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
      startDate={startDate}
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
    <BiggestGaps
      enabled={biggestGapsEnabled}
      setEnabled={toggleBiggestGaps}
      setBiggestGaps={setBiggestGaps}
      setSymbol={setSymbol}
      startDate={startDate}
    />
  </section>
);