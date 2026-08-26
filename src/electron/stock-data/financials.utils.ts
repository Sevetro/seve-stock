import {
    FundamentalsTimeSeriesFinancialsResult,
    FundamentalsTimeSeriesResult
} from 'yahoo-finance2/modules/fundamentalsTimeSeries';
import { FinancialData } from 'yahoo-finance2/modules/quoteSummary';

export function getLatestTtmFinancialResult(results: FundamentalsTimeSeriesResult[]) {
    return results.filter(
        (item): item is FundamentalsTimeSeriesFinancialsResult => item.TYPE === 'FINANCIALS'
    ).at(-1);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function getMargin(value: unknown, totalRevenue: unknown) {
    if (!isFiniteNumber(value) || !isFiniteNumber(totalRevenue) || totalRevenue === 0) return undefined;
    return Number((value / totalRevenue * 100).toFixed(2));
}

function getPercentage(value: unknown) {
    if (!isFiniteNumber(value)) return undefined;
    return Number((value * 100).toFixed(2));
}

export function getMissingTtmFields(financialResult: FundamentalsTimeSeriesFinancialsResult | undefined) {
    const fields: Array<[string, unknown]> = [
        ['totalRevenue', financialResult?.totalRevenue],
        ['grossProfit', financialResult?.grossProfit],
        ['operatingIncome', financialResult?.operatingIncome],
        ['EBITDA', financialResult?.EBITDA],
        ['EBIT', financialResult?.EBIT],
        ['netIncome', financialResult?.netIncome]
    ];

    return fields.filter(([, value]) => !isFiniteNumber(value)).map(([field]) => field);
}

export function mapTtmFinancialData(
    financialResult: FundamentalsTimeSeriesFinancialsResult | undefined,
    financialData: FinancialData | undefined
) {
    const totalRevenue = isFiniteNumber(financialResult?.totalRevenue)
        ? financialResult.totalRevenue
        : isFiniteNumber(financialData?.totalRevenue)
            ? financialData.totalRevenue
            : undefined;
    const grossProfit = isFiniteNumber(financialResult?.grossProfit) ? financialResult.grossProfit : undefined;
    const operatingIncome = isFiniteNumber(financialResult?.operatingIncome) ? financialResult.operatingIncome : undefined;
    const EBITDA = isFiniteNumber(financialResult?.EBITDA) ? financialResult.EBITDA : undefined;
    const EBIT = isFiniteNumber(financialResult?.EBIT) ? financialResult.EBIT : undefined;
    const netIncome = isFiniteNumber(financialResult?.netIncome) ? financialResult.netIncome : undefined;

    const data: TtmFinancialData = {
        totalRevenue,
        grossProfit,
        operatingIncome,
        EBITDA,
        EBIT,
        netIncome,
        grossProfitMargin: getMargin(grossProfit, totalRevenue),
        operatingMargin: getMargin(operatingIncome, totalRevenue) ?? getPercentage(financialData?.operatingMargins),
        ebitMargin: getMargin(EBIT, totalRevenue),
        netIncomeMargin: getMargin(netIncome, totalRevenue) ?? getPercentage(financialData?.profitMargins),
        returnOnEquity: getPercentage(financialData?.returnOnEquity)
    };

    return {
        data,
        hasUsableMetrics: totalRevenue !== undefined || netIncome !== undefined ||
            data.operatingMargin !== undefined || data.netIncomeMargin !== undefined || data.returnOnEquity !== undefined
    };
}