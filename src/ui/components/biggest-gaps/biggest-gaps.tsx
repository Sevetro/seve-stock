import { useState } from 'react';

import { uiErrors } from '../../utils/ui-errors';
import { printUiError } from '../../utils/messages';
import {
  biggestGapsController, biggestGapsControllerLegend, biggestGapsSliderWrapper, biggestGapsWarningIcon, trianglePulse
} from './biggest-gaps.module.scss';
import { Slider, Switch } from '../../design-system';
import { WarningIcon } from '../../design-system/icons';

interface BiggestGapsProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  setBiggestGaps: (biggestGaps: BiggestGaps) => void
  setSymbol: (symbol: string) => void
  startDate: Date
  hasWarning: boolean
}

export const BiggestGaps = ({ enabled, setEnabled, setBiggestGaps, setSymbol, startDate, hasWarning }: BiggestGapsProps) => {
  const [countArr, setCountArr] = useState([10]);
  const count = countArr[0];
  const [loading, setLoading] = useState(false);

  const findBiggestGapsLabel = count === 0
    ? 'Find the biggest gaps - off'
    : `Find ${count} biggest gaps`;

  function handleSlide(count: number[]) {
    if (enabled) setEnabled(false);
    setCountArr(count);
  }

  async function handleBiggestGapsToggle(enable: boolean) {
    if (enable === true) {
      setLoading(true);

      try {
        const biggestGaps = await window.electron.getBiggestGaps(startDate, count);
        if (biggestGaps === undefined || biggestGaps.length === 0) throw new Error(uiErrors.noBiggestGaps);

        const tickersWithValue = biggestGaps.map(({ gap, name, symbol }) => (
          {
            name: `${name} - ${gap}%`,
            symbol,
            gap
          }
        ));

        setBiggestGaps(tickersWithValue);
        setSymbol(biggestGaps[0].symbol);
        setEnabled(true);
      } catch (err) {
        printUiError(handleBiggestGapsToggle.name, err);
      } finally {
        setLoading(false);
      }

    } else {
      setEnabled(false);
    }
  }

  return (
    <fieldset className={biggestGapsController}>
      <legend className={biggestGapsControllerLegend}>
        {findBiggestGapsLabel}
        {enabled && hasWarning && (
          <div className={biggestGapsWarningIcon} data-tooltip="Biggest gaps list might be stale or incomplete">
            <WarningIcon size={20} className={trianglePulse} />
          </div>
        )}
      </legend>
      <div className={biggestGapsSliderWrapper}>
        <Slider
          value={countArr}
          onValueChange={handleSlide}
          max={20}
          aria='Best dividends count'
        />
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleBiggestGapsToggle}
        disabled={count === 0}
        loading={loading}
      />
    </fieldset>
  );
};