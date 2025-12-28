import { infoCard } from './info-card.module.scss';
import { currentPriceToAvg, getAvgPrice, getPercentage } from './info-card.utils';

const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'long'
});

interface InfoCardProps {
  symbol: string
  quote: Quote | undefined
  companyStockData: CompanyStockData | undefined
  ttmFinancialData: TtmFinancialData | undefined
}

export const InfoCard = ({ symbol, quote, companyStockData, ttmFinancialData }: InfoCardProps) => (
  <div className={infoCard}>
    <div>Symbol: {symbol}</div>
    <div>Current price: {quote?.price}</div>
    <div>Price change: {getPercentage(currentPriceToAvg(quote?.price, getAvgPrice(companyStockData)))}</div>
    <div>Dividend: {quote?.dividend && `${quote?.dividend}%`}</div>
    <div>Market cap: {formatter.format(quote?.marketCap ?? 0)}</div>
    <div>Book value: {formatter.format(quote?.bookValue ?? 0)}</div>
    <div>Price to book: {quote?.priceToBook.toFixed(2)}</div>
    <div>Price to earnings: {quote?.priceToEarnings?.toFixed(2)}</div>
    <div>ROE: {getPercentage((ttmFinancialData?.netIncome ?? 0) / (quote?.bookValue ?? 1), 2)}</div>
    <div>Gross profit margin: {ttmFinancialData?.grossProfitMargin}%</div>
    <div>Operating margin: {ttmFinancialData?.operatingMargin}%</div>
    <div>EBIT margin: {ttmFinancialData?.ebitMargin}%</div>
    <div>Net income margin: {ttmFinancialData?.netIncomeMargin}%</div>
  </div>
);