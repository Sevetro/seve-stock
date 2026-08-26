import YahooFinance from 'yahoo-finance2';

const symbols = process.argv.slice(2);
const yahooSymbols = symbols.length > 0 ? symbols : ['11B.WA', 'BHW.WA', 'PZU.WA'];
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const period1 = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const previousYear = new Date().getFullYear() - 1;

function getErrorDetails(error) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            code: 'code' in error ? error.code : undefined
        };
    }
    return { name: 'UnknownError', message: String(error) };
}

async function inspect(module, request) {
    try {
        return { status: 'healthy', data: await request() };
    } catch (error) {
        return { status: 'failed', error: getErrorDetails(error), module };
    }
}

async function diagnoseSymbol(symbol) {
    const ttm = await inspect('fundamentalsTimeSeries', async () => {
        const results = await yahooFinance.fundamentalsTimeSeries(symbol, {
            period1,
            module: 'financials',
            type: 'trailing'
        }, { validateResult: false });
        const latest = results.filter((result) => result.TYPE === 'FINANCIALS').at(-1);
        return {
            latestDate: latest?.date,
            totalRevenue: latest?.totalRevenue !== undefined,
            grossProfit: latest?.grossProfit !== undefined,
            operatingIncome: latest?.operatingIncome !== undefined,
            EBITDA: latest?.EBITDA !== undefined,
            EBIT: latest?.EBIT !== undefined,
            netIncome: latest?.netIncome !== undefined
        };
    });
    const financialData = await inspect('quoteSummary.financialData', async () => {
        const result = await yahooFinance.quoteSummary(symbol, { modules: ['financialData'] });
        return result.financialData;
    });
    const chart = await inspect('chart', async () => {
        const result = await yahooFinance.chart(symbol, {
            period1: `${previousYear}-01-01`,
            period2: `${previousYear}-12-31`
        });
        return { quotes: result.quotes.length, dividends: result.events?.dividends?.length ?? 0 };
    });
    const quote = await inspect('quote', async () => {
        const result = await yahooFinance.quote(symbol, {
            fields: ['regularMarketPrice', 'priceToBook', 'marketCap', 'trailingPE', 'dividendYield']
        });
        return result;
    });

    return { symbol, ttm, financialData, chart, quote };
}

const report = [];
for (const symbol of yahooSymbols) report.push(await diagnoseSymbol(symbol));
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));