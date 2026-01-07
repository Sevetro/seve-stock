import { useState } from 'react';

import { advancedFilterTabId } from '../filter-tabs';
import {
  advancedFiltersContainer, advancedFiltersFieldset, advancedFiltersFooter, advancedFiltersInput,
  advancedFiltersLabel, advancedFiltersLegend, filtersList
} from './advanced-filters.module.scss';
import { MinMaxFilter } from '../min-max-filter';
import { initialFilters, advancedFilters, scaleMinMax } from './advanced-filters.utils';
import { Button } from '../../design-system';
import { printUiError } from '../../utils/messages';

export const advancedFilterPanelId = 'panel-advanced';

interface AdvancedFiltersProps {
  advancedFiltersEnabled: boolean
  toggleAdvancedFilters: (enable: boolean) => void
  setAdvancedFiltersTickers: (tickers: Tickers) => void
  setSymbol: (symbol: string) => void
  startDate: Date
}

export const AdvancedFilters = ({
  advancedFiltersEnabled,
  toggleAdvancedFilters,
  setAdvancedFiltersTickers,
  setSymbol,
  startDate
}: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const validFiltersEntires = Object.entries(filters).filter(([, { min, max }]) => (
    min !== undefined || max !== undefined
  )) as [AdvancedFiltersKey, MinMax][];

  const isAnyFilterSet = validFiltersEntires.length > 0;
  const canReset = isAnyFilterSet || advancedFiltersEnabled;

  const setFilterValue = (key: AdvancedFiltersKey, type: 'min' | 'max', value: number | undefined) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], [type]: value }
    }));
  };

  const handleAdvancedFiltersSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    const adjustedFiltersEntries = validFiltersEntires.map(([key, { min, max }]) => {
      const scale = advancedFilters[key].scale;
      return [key, {
        min: scaleMinMax(min, scale),
        max: scaleMinMax(max, scale)
      }];
    });
    const adjustedFilters = Object.fromEntries(adjustedFiltersEntries) as
      Partial<Record<AdvancedFiltersKey, MinMax>>;

    try {
      const filteredTickers = await window.electron.getAdvancedFiltersResult(adjustedFilters, startDate);
      if (filteredTickers === undefined || filteredTickers.length === 0) {
        setAdvancedFiltersTickers([]);
        setSymbol('');
      } else {
        setAdvancedFiltersTickers(filteredTickers);
        setSymbol(filteredTickers[0].symbol);
      }
      toggleAdvancedFilters(true);

    } catch (err) {
      printUiError(handleAdvancedFiltersSubmit.name, err);
    } finally {
      setIsLoading(false);
    }
  };

  function handleResetClick() {
    toggleAdvancedFilters(false);
    setFilters(initialFilters);
  }

  return (
    <form
      role="tabpanel"
      id={advancedFilterPanelId}
      aria-labelledby={advancedFilterTabId}
      className={advancedFiltersContainer}
      onSubmit={handleAdvancedFiltersSubmit}
    >
      <div className={filtersList}>
        {(Object.keys(filters) as AdvancedFiltersKey[]).map(key => (
          <MinMaxFilter
            key={key}
            label={advancedFilters[key].label}
            valueMin={filters[key].min}
            valueMax={filters[key].max}
            setValueMin={v => setFilterValue(key, 'min', v)}
            setValueMax={v => setFilterValue(key, 'max', v)}
            fieldsetClassName={advancedFiltersFieldset}
            legendClassName={advancedFiltersLegend}
            labelClassName={advancedFiltersLabel}
            inputClassName={advancedFiltersInput}
          />
        ))}
      </div>

      <div className={advancedFiltersFooter}>
        <Button
          disabled={!canReset || isLoading}
          onClick={handleResetClick}
        >
          Reset
        </Button>
        <Button
          type='submit'
          disabled={!isAnyFilterSet || isLoading}
        >
          {isLoading ? 'Searching…' : 'Search'}
        </Button>
      </div>
    </form>
  );
};