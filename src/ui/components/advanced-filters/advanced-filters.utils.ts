interface AdvancedFiltersValue {
  label: string
  scale?: number
}

export const advancedFilters: Record<AdvancedFiltersKey, AdvancedFiltersValue> = {
  priceChange: { label: 'Price change (%)' },
  dividend: { label: 'Dividend (%)' },
  marketCap: {
    label: 'Market capitalization (mln)',
    scale: 1000000
  },
  bookValue: {
    label: 'Book value (mln)',
    scale: 1000000
  },
  priceToEarnings: { label: 'Price to earnings' },
  priceToBook: { label: 'Price to book value' }
};

export const initialFilters = Object.fromEntries(
  (Object.keys(advancedFilters) as AdvancedFiltersKey[]).map(key => [
    key,
    { min: undefined, max: undefined }
  ])
) as AdvancedFilters;

export function scaleMinMax(value: number | undefined, scale: number | undefined) {
  return (value === undefined || scale === undefined) ? value : (value * scale);
}