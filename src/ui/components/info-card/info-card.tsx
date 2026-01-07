import { useCombinedInfo } from '../../hooks';
import { infoCard } from './info-card.module.scss';
import { getPercentage } from './info-card.utils';

const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'long'
});

interface InfoCardProps {
  symbol: string
  startDate: Date
}

export const InfoCard = ({ symbol, startDate }: InfoCardProps) => {
  const combinedInfo = useCombinedInfo(symbol, startDate);

  return (
    <div className={infoCard}>
      <div>Symbol: {symbol}</div>
      <div>Current price: {combinedInfo?.price}</div>
      <div>Price change: {combinedInfo?.priceChange.toFixed(0)}%</div>
      <div>Price gap: {combinedInfo?.priceGap}%</div>
      <div>Dividend: {combinedInfo?.dividend && `${combinedInfo?.dividend}%`}</div>
      <div>Market cap: {formatter.format(combinedInfo?.marketCap ?? 0)}</div>
      <div>Book value: {formatter.format(combinedInfo?.bookValue ?? 0)}</div>
      <div>Price to book: {combinedInfo?.priceToBook.toFixed(2)}</div>
      <div>Price to earnings: {combinedInfo?.priceToEarnings?.toFixed(2)}</div>
      <div>ROE: {getPercentage((combinedInfo?.netIncome ?? 0) / (combinedInfo?.bookValue ?? 1), 2)}</div>
      <div>Gross profit margin: {combinedInfo?.grossProfitMargin}%</div>
      <div>Operating margin: {combinedInfo?.operatingMargin}%</div>
      <div>EBIT margin: {combinedInfo?.ebitMargin}%</div>
      <div>Net income margin: {combinedInfo?.netIncomeMargin}%</div>
    </div>
  );
};