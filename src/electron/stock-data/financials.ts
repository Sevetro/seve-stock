import { FundamentalsTimeSeriesFinancialsResult } from "yahoo-finance2/modules/fundamentalsTimeSeries";
import { YahooFinanceType } from "../main.js";
import { ExtendedFinancialData, FinancialData } from "./types.js";

export async function getTtmFinancialData(yahooSymbol: string, yahooFinance: YahooFinanceType) {
  const period1 = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const financialResults = (await yahooFinance.fundamentalsTimeSeries(yahooSymbol, {
    period1,
    module: 'financials',
    type: 'trailing'
  }, {
    validateResult: false
  })).filter((item: any): item is FundamentalsTimeSeriesFinancialsResult => item.TYPE === 'FINANCIALS');

  //TODO: errors


  const { totalRevenue, operatingRevenue, totalExpenses, costOfRevenue,
    grossProfit, operatingExpense, operatingIncome, EBITDA,
    EBIT, netIncome }: FinancialData = financialResults[0]

  return {
    totalRevenue,
    operatingRevenue,
    totalExpenses,
    costOfRevenue,
    grossProfit,
    operatingExpense,
    operatingIncome,
    EBITDA,
    EBIT,
    netIncome,
    operatingMargin: Number((EBIT / totalRevenue * 100).toFixed(2))
  } as ExtendedFinancialData;
}
