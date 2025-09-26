import qs from 'qs';

import { Product } from '@/types/types';

interface MedusaPrice {
  amount: number;
  currency_code: string;
}

interface MedusaProductOptionValue {
  id: string;
  value: string;
}

interface MedusaProductOption {
  id: string;
  title: string;
  values?: MedusaProductOptionValue[];
}

interface MedusaProductVariant {
  id: string;
  title: string;
  prices?: MedusaPrice[];
}

interface MedusaProductCategory {
  id: string;
  name: string;
}

interface MedusaProductImage {
  id?: string;
  url: string;
}

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  images?: MedusaProductImage[];
  variants?: MedusaProductVariant[];
  options?: MedusaProductOption[];
  categories?: MedusaProductCategory[];
  collections?: { id: string; title: string }[];
}

interface MedusaListResponse<T> {
  products: T[];
}

const DEFAULT_EXPAND = [
  'variants',
  'variants.prices',
  'images',
  'options',
  'categories',
  'collections',
].join(',');

const DEFAULT_LIMIT = 50;

function getMedusaBaseUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_MEDUSA_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:9000';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function medusaFetch<T>(path: string): Promise<T | null> {
  const baseUrl = getMedusaBaseUrl();

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch Medusa data from ${url}: ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error('Failed to fetch Medusa data', error);
    return null;
  }
}

function normaliseAmount(amount: number): number {
  if (amount >= 100) {
    return amount / 100;
  }
  return amount;
}

function extractPrice(product: MedusaProduct, preferredCurrency = 'usd') {
  const priceEntries =
    product.variants?.flatMap((variant) => variant.prices ?? []) ?? [];
  if (!priceEntries.length) {
    return { amount: 0, currency_code: preferredCurrency };
  }

  const preferredPrices = priceEntries.filter(
    (price) => price.currency_code.toLowerCase() === preferredCurrency
  );
  const relevantPrices = preferredPrices.length ? preferredPrices : priceEntries;

  const minAmount = Math.min(...relevantPrices.map((price) => price.amount));
  const currency_code = relevantPrices[0]?.currency_code ?? preferredCurrency;

  return {
    amount: normaliseAmount(minAmount),
    currency_code,
  };
}

function mapOptionToPerk(option: MedusaProductOption) {
  const values = option.values ?? [];
  const formattedValues = values
    .map((value) => value.value)
    .filter(Boolean)
    .join(', ');

  if (!formattedValues) {
    return null;
  }

  return {
    text: `${option.title}: ${formattedValues}`,
  };
}

function mapMedusaProduct(product: MedusaProduct): Product {
  const { amount, currency_code } = extractPrice(product);
  const images = product.images?.length
    ? product.images
    : product.thumbnail
    ? [{ url: product.thumbnail }]
    : [];

  const perks = (product.options ?? [])
    .map(mapOptionToPerk)
    .filter((perk): perk is { text: string } => Boolean(perk));

  const plans = (product.variants ?? []).map((variant) => ({
    id: variant.id,
    name: variant.title,
  }));

  return {
    id: product.id,
    name: product.title,
    slug: product.handle,
    description: product.description ?? '',
    price: amount,
    currency_code,
    plans,
    perks,
    featured: false,
    images,
    categories: product.categories ?? [],
    collections: product.collections ?? [],
    dynamic_zone: [],
  };
}

export async function fetchMedusaProducts(): Promise<Product[]> {
  const query = qs.stringify(
    {
      limit: DEFAULT_LIMIT,
      expand: DEFAULT_EXPAND,
    },
    { addQueryPrefix: true }
  );

  const data = await medusaFetch<MedusaListResponse<MedusaProduct>>(
    `/store/products${query}`
  );

  if (!data?.products?.length) {
    return [];
  }

  return data.products.map(mapMedusaProduct);
}

export async function fetchMedusaProductByHandle(
  handle: string
): Promise<Product | null> {
  const query = qs.stringify(
    {
      handle,
      limit: 1,
      expand: DEFAULT_EXPAND,
    },
    { addQueryPrefix: true }
  );

  const data = await medusaFetch<MedusaListResponse<MedusaProduct>>(
    `/store/products${query}`
  );

  if (!data?.products?.length) {
    return null;
  }

  return mapMedusaProduct(data.products[0]);
}

export async function fetchMedusaCollections() {
  const data = await medusaFetch<{
    collections: { id: string; title: string; handle: string }[];
  }>(`/store/collections`);

  if (!data?.collections?.length) {
    return [];
  }

  return data.collections;
}
