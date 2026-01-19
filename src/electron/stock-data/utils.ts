export function timestampParser(key: string, value: unknown) {
  return key === 'timestamp' ? new Date(value as string) : value;
}

export function historicCacheParser(key: string, value: unknown) {
  if (key === 'timestamp') return new Date(value as string);

  if (value != null && typeof value === 'object' && 'date' in value) {
    return { ...value, date: new Date(value.date as string) };
  }

  return value;
}

export function inMinMaxRange(value: number | undefined, min?: number, max?: number) {
  return value !== undefined &&
    (min === undefined || value >= min) &&
    (max === undefined || value <= max);
}

export function numberToFixed(number: number, precision: number) {
  return Number(number.toFixed(precision));
}