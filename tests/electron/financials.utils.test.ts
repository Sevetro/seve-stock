import { describe, expect, it } from 'vitest';
import { FundamentalsTimeSeriesFinancialsResult } from 'yahoo-finance2/modules/fundamentalsTimeSeries';
import { FinancialData } from 'yahoo-finance2/modules/quoteSummary';

import {
    getLatestTtmFinancialResult,
    getMissingTtmFields,
    mapTtmFinancialData
} from '../../src/electron/stock-data/financials.utils.js';

function financials(values: Partial<FundamentalsTimeSeriesFinancialsResult>) {
    return {
        TYPE: 'FINANCIALS',
        date: new Date('2026-03-31'),
        ...values
    } as FundamentalsTimeSeriesFinancialsResult;
}

function financialData(values: Partial<FinancialData>) {
    return {
        maxAge: 86400,
        recommendationKey: 'hold',
        financialCurrency: 'PLN',
        ...values
    } as FinancialData;
}

describe('TTM financial data mapping', () => {
    it('calculates margins for a complete operating-company TTM record', () => {
        const result = mapTtmFinancialData(financials({
            totalRevenue: 1000,
            grossProfit: 600,
            operatingIncome: 200,
            EBITDA: 250,
            EBIT: 180,
            netIncome: 150
        }), undefined);

        expect(result.hasUsableMetrics).toBe(true);
        expect(result.data).toMatchObject({
            grossProfitMargin: 60,
            operatingMargin: 20,
            ebitMargin: 18,
            netIncomeMargin: 15
        });
    });

    it('selects the newer complete TTM record instead of an older partial entry', () => {
        const olderPartialResult = financials({ basicEPS: 4.36 });
        const newerCompleteResult = financials({
            totalRevenue: 1000,
            grossProfit: 600,
            operatingIncome: 200,
            EBITDA: 250,
            EBIT: 180,
            netIncome: 150
        });

        const latestResult = getLatestTtmFinancialResult([olderPartialResult, newerCompleteResult]);

        expect(latestResult).toBe(newerCompleteResult);
        expect(getMissingTtmFields(olderPartialResult)).toEqual([
            'totalRevenue', 'grossProfit', 'operatingIncome', 'EBITDA', 'EBIT', 'netIncome'
        ]);
        expect(getMissingTtmFields(newerCompleteResult)).toEqual([]);
    });

    it('keeps bank TTM data and supplements available ratios from financialData', () => {
        const result = mapTtmFinancialData(financials({
            totalRevenue: 3311470000,
            netIncome: 1616968000
        }), financialData({
            operatingMargins: 0.61458,
            profitMargins: 0.49648,
            returnOnEquity: 0.17518
        }));

        expect(result.hasUsableMetrics).toBe(true);
        expect(result.data).toMatchObject({
            totalRevenue: 3311470000,
            netIncome: 1616968000,
            operatingMargin: 61.46,
            netIncomeMargin: 48.83,
            returnOnEquity: 17.52
        });
        expect(result.data.grossProfitMargin).toBeUndefined();
        expect(result.data.ebitMargin).toBeUndefined();
    });

    it('rejects null and missing numeric values as unusable metrics', () => {
        const result = mapTtmFinancialData(financials({
            totalRevenue: null,
            netIncome: null
        } as unknown as Partial<FundamentalsTimeSeriesFinancialsResult>), undefined);

        expect(result.hasUsableMetrics).toBe(false);
        expect(result.data.totalRevenue).toBeUndefined();
        expect(result.data.netIncome).toBeUndefined();
    });
});