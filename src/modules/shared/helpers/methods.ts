import { Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export function extractTokenFromHeader(authorization: string) {
  if (!authorization) return;
  return authorization.slice(7);
}

export function getDateRange(fromDate: string, toDate: string) {
  // check fromDate and toDate for swapping if needed
  let start: Date, end: Date;
  const from = !fromDate || !new Date(fromDate) ? null : new Date(fromDate);
  const to = !toDate || !new Date(toDate) ? null : new Date(toDate);
  if (from && to) {
    start = from.getTime() < to.getTime() ? from : to;
    end = to.getTime() > from.getTime() ? to : from;
  }

  // use default dates if needed
  const start_date = start || from || new Date('2024-01-01T00:00:00');
  const end_date = end || to || new Date();
  return Between(start_date, end_date);
}

export function getHexColor(colorName: string): string {
  const colors = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gray: '#808080',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
  };

  return colors[colorName.toLowerCase()] || colorName;
}

export function getUniqueArray(array: any[], key: string) {
  const response = array.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t[key] === value[key]),
  );

  return response;
}

export function replaceBy(
  full_string: string,
  partToRemove: string,
  partToReplace: string,
) {
  return full_string.replace(partToRemove, partToReplace);
}

export function calculatePriceAfterDiscount(price: number, discount: number) {
  return price * (1 - ((discount || 0) / 100));
}

export function addHttpsToUrl(url: string, searchBy: string) {
  let result: string;
  if (url?.includes(searchBy) && !url?.includes('https://')) {
    result = `https://${url}`;
  } else {
    result = url;
  }

  return result;
};

export function generateUniqueVoucherCode() {
  const prefix = "XMDH";
  const uuid = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}${uuid}`;
}

export function mapWithTranslationKeys(array: KeyValue[]): KeyValue[] {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/; // Arabic Unicode range
  const response: KeyValue[] = [];
  
  for (const element of array) {
    if (!element.value) continue;
    // Remove special characters and numbers
    const cleanText = element.value.replace(/[^a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '');

    // check language of each value
    let lang: string = 'en';
    if (arabicRegex.test(cleanText)) lang = 'ar';

    // map data with new keys
    response.push({ key: `${element.key}_${lang}`, value: element.value });
  }

  return response;
}

interface KeyValue { key: string; value: string; }
