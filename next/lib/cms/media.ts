import { unstable_noStore as noStore } from 'next/cache';

function joinUrl(base: string, path: string): string {
  if (!base) {
    return path;
  }
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function resolveMediaUrl(url: string): string {
  noStore();

  if (!url) {
    return url;
  }

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//')
  ) {
    return url;
  }

  return joinUrl(process.env.NEXT_PUBLIC_API_URL ?? '', url);
}
