import { useState } from 'react';
import { subDays } from 'date-fns';

import { Combobox, Select } from '../../design-system';
import { useCompaniesList } from '../../hooks/useCompaniesList';
import { CandleChart } from '../candle-chart/candle-chart';
import { useCompanyStockData } from '../../hooks/useCompanyStockData';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import { functionsCard, mainFrame, mainFrameControls, tickerCard } from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';
import { periodSelectOptions } from './main-frame.utils';

function createSelectOptions(companiesList: CompaniesList | undefined) {
  return companiesList?.map(({ company, ticker }) => ({ label: company, value: ticker })) ?? [];
}

export const MainFrame = () => {
  const companiesList = useCompaniesList();
  const [ticker, setTicker] = useState('PKN');
  const [avgPrice, setAvgPrice] = useState(0);
  const [period, setPeriod] = useState('30');

  const stooqStartDate = subDays(new Date(), Number(period));

  const companyStockData = useCompanyStockData(ticker, convertNativeDateToStooqDate(stooqStartDate));

  async function handleButtonClick() {
    setAvgPrice(await window.electron.getAvgPrice(ticker, convertNativeDateToStooqDate(stooqStartDate)) ?? 0);
  }

  return (
    <div className={mainFrame}>
      <div className={tickerCard}>
        <div className={mainFrameControls}>
          <Combobox
            placeholder='Ticker'
            options={createSelectOptions(companiesList)}
            value={ticker}
            setValue={setTicker}
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
        </div>
        {ticker !== '' && <CandleChart data={createCandlestickData(companyStockData ?? [])} />}
      </div>

      <div className={functionsCard}>
        <button>elo</button>
      </div>

    </div>
  );
}; 