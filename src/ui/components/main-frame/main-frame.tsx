import { useState } from 'react';
import { subDays } from 'date-fns';

import { Combobox, Select } from '../../design-system';
import { useCompaniesList } from '../../hooks/useCompaniesList';
import { CandleChart } from '../candle-chart/candle-chart';
import { useCompanyStockData } from '../../hooks/useCompanyStockData';
import { createCandlestickData } from '../candle-chart/candle-chart.utils';
import type { SelectOptions } from '../../design-system/select';
import { mainFrame, mainFrameControls } from './main-frame.module.scss';
import { convertNativeDateToStooqDate } from '../../../electron/shared-with-ui/date';

function createSelectOptions(companiesList: CompaniesList | undefined) {
  return companiesList?.map(({ company, ticker }) => ({ label: company, value: ticker })) ?? [];
}

const selectOptions: SelectOptions = [{ label: '1 day', value: '1' }, { label: '2 days', value: '2' },
{ label: '1 week', value: '7' }, { label: '2 weeks', value: '14' }, { label: '1 month', value: '30' },
{ label: '2 months', value: '60' }, { label: '3 months', value: '90' }, { label: '6 months', value: '180' },
{ label: '1 year', value: '365' }, { label: '2 years', value: '730' }, { label: '3 years', value: '1095' },
{ label: '5 years', value: '1826' }, { label: '10 years', value: '3652' }
];

export const MainFrame = () => {
  const companiesList = useCompaniesList();
  const [ticker, setTicker] = useState('');
  const [avgPrice, setAvgPrice] = useState(0);
  const [period, setPeriod] = useState('7')

  const stooqStartDate = subDays(new Date(), Number(period))

  const companyStockData = useCompanyStockData(ticker, convertNativeDateToStooqDate(stooqStartDate));


  async function handleButtonClick() {
    setAvgPrice(await window.electron.getAvgPrice(ticker, convertNativeDateToStooqDate(stooqStartDate)) ?? 0);
  }

  return (
    <div className={mainFrame}>
      <div className={mainFrameControls}>
        <Combobox
          placeholder='Ticker'
          options={createSelectOptions(companiesList)}
          value={ticker}
          setValue={setTicker}
          searchPlaceholder='Search ticker...'
        />

        <Select placeholder='Period' value={period} setValue={setPeriod} options={selectOptions} />

        <button onClick={handleButtonClick}>Get average price</button>
        <span>{avgPrice}</span>
      </div>

      {ticker !== '' && <CandleChart data={createCandlestickData(companyStockData ?? [])} />}

    </div>
  );
}; 