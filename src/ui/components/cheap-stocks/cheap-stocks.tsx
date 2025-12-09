import { useState } from 'react';

import {
  cheapStockController, cheapStockControllerLegend, cheapStockSliderWrapper, cheapStocksWarningIcon, trianglePulse
} from './cheap-stocks.module.scss';
import { Slider, Switch } from '../../design-system';
import { uiErrors } from '../../utils/ui-errors';
import { printUiError } from '../../utils/messages';
import { WarningIcon } from '../../design-system/icons';

interface CheapStocksProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  stooqStartDate: string
  setCheapStocks: (cheapStocks: CheapStocks) => void
  setSymbol: (symbol: string) => void
  hasCheapStocksWarning: boolean
}

export const CheapStocks = ({ enabled, setEnabled, stooqStartDate, setCheapStocks, setSymbol, hasCheapStocksWarning }: CheapStocksProps) => {
  const [cheapStocksCountArr, setCheapStocksCountArr] = useState([0]);
  const cheapStocksCount = cheapStocksCountArr[0];
  const [cheapStocksLoading, setCheapStocksLoading] = useState(false);

  const findCheapStockLabel = cheapStocksCount === 0
    ? 'Find the cheapest stocks - off'
    : `Find ${cheapStocksCount} cheap stocks`;

  function handleCheapStocksSlide(count: number[]) {
    if (enabled) setEnabled(false);
    setCheapStocksCountArr(count);
  }

  async function handleCheapStocksToggle(checked: boolean) {
    if (checked === true) {
      setCheapStocksLoading(true);

      try {
        const cheapStocks = await window.electron.getCheapStocks(stooqStartDate, cheapStocksCount);
        if (cheapStocks === undefined || cheapStocks.length === 0) throw new Error(uiErrors.noCheapStocks);

        const cheapStocksWithValue = cheapStocks.map(({ discount, name, symbol }) => (
          {
            name: `${name} - ${(discount * 100).toFixed(0)}%`,
            symbol,
            discount
          }
        ));

        setCheapStocks(cheapStocksWithValue);
        setSymbol(cheapStocks[0].symbol);
        setEnabled(true);
      } catch (err) {
        printUiError(handleCheapStocksToggle.name, err);
      } finally {
        setCheapStocksLoading(false);
      }

    } else {
      setEnabled(false);
    }
  }

  return (
    <fieldset className={cheapStockController}>
      <legend className={cheapStockControllerLegend}>
        {findCheapStockLabel}
        {enabled && hasCheapStocksWarning && (
          <div className={cheapStocksWarningIcon} data-tooltip="Cheap stocks list might be stale or incomplete">
            <WarningIcon size={20} className={trianglePulse} />
          </div>
        )}
      </legend>
      <div className={cheapStockSliderWrapper}>
        <Slider
          value={cheapStocksCountArr}
          onValueChange={handleCheapStocksSlide}
          max={20}
          aria='Discount list length'
        />
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleCheapStocksToggle}
        disabled={cheapStocksCount === 0}
        loading={cheapStocksLoading}
      />
    </fieldset>
  );
};