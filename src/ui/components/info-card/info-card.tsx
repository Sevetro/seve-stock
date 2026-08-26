import { useCombinedInfo } from '../../hooks';
import { infoCard } from './info-card.module.scss';

const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'long'
});

function formatPercentage(value: number | undefined) {
  return value === undefined ? 'N/A' : `${value.toFixed(2)}%`;
}

interface InfoCardProps {
  symbol: string
  startDate: Date
}

export const InfoCard = ({ symbol, startDate }: InfoCardProps) => {
  const combinedInfo = useCombinedInfo(symbol, startDate);

  const dividend = combinedInfo?.dividend === undefined ||
    combinedInfo.dividend === 0
    ? '-'
    : combinedInfo.dividend + '%';

  return (
    <div className={infoCard}>
      <div>Symbol: {symbol}</div>
      <div>Current price: {combinedInfo?.price}</div>
      <div>Price change: {combinedInfo?.priceChange}%</div>
      <div>Price gap: {combinedInfo?.priceGap}%</div>
      <div>Dividend: {dividend}</div>
      <div>Market cap: {formatter.format(combinedInfo?.marketCap ?? 0)}</div>
      <div>Book value: {formatter.format(combinedInfo?.bookValue ?? 0)}</div>
      <div>Price to book: {combinedInfo?.priceToBook.toFixed(2)}</div>
      <div>Price to earnings: {combinedInfo?.priceToEarnings?.toFixed(2)}</div>
      <div>ROE: {formatPercentage(combinedInfo?.returnOnEquity ??
        (combinedInfo?.netIncome ?? 0) / (combinedInfo?.bookValue ?? 1) * 100)}</div>
      <div>Gross profit margin: {formatPercentage(combinedInfo?.grossProfitMargin)}</div>
      <div>Operating margin: {formatPercentage(combinedInfo?.operatingMargin)}</div>
      <div>EBIT margin: {formatPercentage(combinedInfo?.ebitMargin)}</div>
      <div>Net income margin: {formatPercentage(combinedInfo?.netIncomeMargin)}</div>
    </div>
  );
};