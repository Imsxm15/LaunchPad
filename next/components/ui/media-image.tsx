import { unstable_noStore as noStore } from 'next/cache';
import Image from 'next/image';
import { ComponentProps } from 'react';

import { resolveMediaUrl } from '@/lib/cms/media';

interface MediaImageProps
  extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  src: string | null;
  alt: string | null;
}

export function getMediaUrl(url: string | null) {
  if (url == null) return null;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return resolveMediaUrl(url);
}

export function MediaImage({
  src,
  alt,
  className,
  ...rest
}: Readonly<MediaImageProps>) {
  noStore();
  const imageUrl = getMediaUrl(src);
  if (!imageUrl) return null;
  return (
    <Image
      src={imageUrl}
      alt={alt ?? 'No alternative text provided'}
      className={className}
      {...rest}
    />
  );
}
