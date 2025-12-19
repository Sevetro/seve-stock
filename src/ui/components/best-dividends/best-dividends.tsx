import { useState } from 'react';

import {
  bestDividendsController, bestDividendsControllerLegend, bestDividendsSliderWrapper, bestDividendsWarningIcon, trianglePulse
} from './best-dividends.module.scss';
import { Slider, Switch } from '../../design-system';
import { uiErrors } from '../../utils/ui-errors';
import { printUiError } from '../../utils/messages';
import { WarningIcon } from '../../design-system/icons';

interface BestDividendsProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  setBestDividends: (bestDividends: BestDividends) => void
  setSymbol: (symbol: string) => void
  areBestDividendsStale: boolean
}

export const BestDividends = ({ enabled, setEnabled, setBestDividends, setSymbol, areBestDividendsStale }: BestDividendsProps) => {
  const [bestDividendsCountArr, setBestDividendsCountArr] = useState([0]);
  const bestDividendsCount = bestDividendsCountArr[0];
  const [bestDividendsLoading, setBestDividendsLoading] = useState(false);

  const findBestDividendsLabel = bestDividendsCount === 0
    ? 'Find the best dividends - off'
    : `Find ${bestDividendsCount} best dividends`;

  function handleBestDividendsSlide(count: number[]) {
    if (enabled) setEnabled(false);
    setBestDividendsCountArr(count);
  }

  async function handleBestDividendsToggle(checked: boolean) {
    if (checked === true) {
      setBestDividendsLoading(true);

      try {
        const bestDividends = await window.electron.getBestDividends(bestDividendsCount);
        if (bestDividends === undefined || bestDividends.length === 0) throw new Error(uiErrors.noBestDividends);

        const bestDividendsWithValue = bestDividends.map(({ dividend, name, symbol }) => (
          {
            name: `${name} - ${dividend.toFixed(0)}%`,
            symbol,
            dividend
          }
        ));

        setBestDividends(bestDividendsWithValue);
        setSymbol(bestDividends[0].symbol);
        setEnabled(true);
      } catch (err) {
        printUiError(handleBestDividendsToggle.name, err);
      } finally {
        setBestDividendsLoading(false);
      }

    } else {
      setEnabled(false);
    }
  }

  return (
    <fieldset className={bestDividendsController}>
      <legend className={bestDividendsControllerLegend}>
        {findBestDividendsLabel}
        {enabled && areBestDividendsStale && (
          <div className={bestDividendsWarningIcon} data-tooltip="Dividends are stale or incomplete">
            <WarningIcon size={20} className={trianglePulse} />
          </div>
        )}
      </legend>
      <div className={bestDividendsSliderWrapper}>
        <Slider
          value={bestDividendsCountArr}
          onValueChange={handleBestDividendsSlide}
          max={20}
          aria='Best dividends count'
        />
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleBestDividendsToggle}
        disabled={bestDividendsCount === 0}
        loading={bestDividendsLoading}
      />
    </fieldset>
  );
};