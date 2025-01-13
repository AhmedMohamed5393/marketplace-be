import { Transform } from 'class-transformer';

export function ConvertStringCase(toLowerCase = false) {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      if (!toLowerCase) {
        return value.toUpperCase();
      } else {
        return value.toLowerCase();
      }
    }
  });
}
