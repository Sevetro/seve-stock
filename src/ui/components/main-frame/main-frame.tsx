import { useState } from "react";

import { Combobox, Select } from "../../design-system";
import { useCompaniesList } from "../../hooks/useCompaniesList";
import { CandleChart } from "../candle-chart/candle-chart";
import { useCompanyStockData } from "../../hooks/useCompanyStockData";
import { createCandlestickData } from "../candle-chart/candle-chart.utils";
import type { SelectOptions } from "../../design-system/select";
import { mainFrame } from "./main-frame.module.scss";

function createSelectOptions(companiesList: CompaniesList | undefined) {
  return companiesList?.map(({ company, ticker }) => ({ label: company, value: ticker })) ?? [];
}

export const MainFrame = () => {
  const companiesList = useCompaniesList();
  const [value, setValue] = useState("");

  const companyStockData = useCompanyStockData(value, '20241010');

  const selectOptions: SelectOptions = [{ label: '1 day', value: '1' }, { label: '2 days', value: '2' },
  { label: '1 week', value: '7' }, { label: '2 weeks', value: '14' }, { label: '1 month', value: '30' },
  { label: '2 months', value: '60' }, { label: '3 months', value: '90' }, { label: '6 months', value: '180' },
  { label: '1 year', value: '365' }, { label: '2 years', value: '730' }, { label: '3 years', value: '1095' },
  { label: '5 years', value: '1826' }, { label: '10 years', value: '3652' }
  ];

  return (
    <div className={mainFrame}>
      <Combobox options={createSelectOptions(companiesList)} value={value} setValue={setValue} />

      <Select options={selectOptions} />

      {value !== "" && <CandleChart data={createCandlestickData(companyStockData ?? [])} />}

    </div>
  );
}; 