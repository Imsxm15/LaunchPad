import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (text: string | null | undefined, length: number) => {
  if (!text) {
    return '';
  }

  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export const formatNumber = (
  value: number | null | undefined,
  locale: string = 'en-US'
): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
