// Stooq date format is YYYYMMDD

export function convertStringDateToStooqDate(date: string) {
  return date.replaceAll('-', '');
}

export function timestampParser(key: string, value: unknown) {
  return key === 'timestamp' ? new Date(value as string) : value;
}