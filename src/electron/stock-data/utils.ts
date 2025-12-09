// Stooq date format is YYYYMMDD

export function convertStringDateToStooqDate(date: string) {
  return date.replaceAll('-', '');
}

export function timestampParser(key: string, value: unknown) {
  return key === 'timestamp' ? new Date(value as string) : value;
}

export function getBiggerNumber(num1: number | undefined, num2: number | undefined) {
  if (num1 === undefined && num2 === undefined) throw new Error('Both numbers are undefined.');
  if (num1 === undefined || (num2 !== undefined && num2 >= num1)) return num2;
  if (num2 === undefined || (num1 !== undefined && num1 >= num2)) return num1;
}