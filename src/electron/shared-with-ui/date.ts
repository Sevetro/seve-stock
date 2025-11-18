import { format } from 'date-fns';

export function convertNativeDateToStooqDate(date: Date) {
  return format(date, 'yyyyMMdd');
}