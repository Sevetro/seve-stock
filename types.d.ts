interface Window {
  electron: {
    getCompaniesList: () => Promise<CompaniesList | undefined>
    getCompanyStockData: (ticker: string, stooqStartDate: string) => Promise<CompanyStockData | undefined>
    getAvgPrice: (ticker: string, stooqStartDate: string) => Promise<number | undefined>
  };
}

type EventPayloadMap = {
  getCompaniesList: Promise<CompaniesList | undefined>
  getCompanyStockData: Promise<CompanyStockData | undefined>
  getAvgPrice: Promise<number | undefined>
};

interface CompanyWithSymbol {
  ticker: string
  company: string
  fullname: string
}

type CompaniesList = CompanyWithSymbol[]

interface StockDataRecord {
  date: string;
  open: number
  high: number
  low: number
  close: number
  avg: number
};

type CompanyStockData = StockDataRecord[]