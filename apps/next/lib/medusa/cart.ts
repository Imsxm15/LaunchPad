import { getMedusaBaseUrl } from './config';

const CART_STORAGE_KEY = 'medusa_cart_id';
const CART_EXPAND = [
  'items',
  'items.variant',
  'items.variant.product',
  'region',
  'shipping_address',
  'billing_address',
].join(',');

export const CART_QUERY = `?expand=${encodeURIComponent(CART_EXPAND)}`;

export interface MedusaPrice {
  amount: number;
  currency_code: string;
}

export interface MedusaRegion {
  id: string;
  currency_code: string;
}

export interface MedusaVariant {
  id: string;
  title: string;
  product_id?: string;
  prices?: MedusaPrice[];
}

export interface MedusaLineItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  quantity: number;
  variant_id: string;
  product_id: string;
  unit_price: number;
  subtotal?: number;
  total?: number;
}

export interface MedusaCart {
  id: string;
  items: MedusaLineItem[];
  region?: MedusaRegion;
  subtotal?: number;
  total?: number;
  tax_total?: number;
  discount_total?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MedusaTrackingLink {
  id?: string;
  url?: string | null;
  tracking_number?: string | null;
}

export interface MedusaFulfillment {
  id: string;
  tracking_links?: MedusaTrackingLink[];
}

export interface MedusaOrder {
  id: string;
  display_id?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  currency_code?: string;
  subtotal?: number;
  total?: number;
  created_at?: string;
  items?: MedusaLineItem[];
  fulfillments?: MedusaFulfillment[];
}

interface CartResponse {
  cart: MedusaCart;
}

interface CompleteCartResponse {
  type: 'order' | 'cart';
  data: MedusaOrder | MedusaCart;
  order?: MedusaOrder;
  cart?: MedusaCart;
}

async function medusaStoreFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T | null> {
  const baseUrl = getMedusaBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(init.headers ?? {});
  headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch Medusa store data from ${url}: ${response.status}`
      );
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('Failed to fetch Medusa store data', error);
    return null;
  }
}

export async function createMedusaCart(): Promise<MedusaCart | null> {
  const data = await medusaStoreFetch<CartResponse>(
    `/store/carts${CART_QUERY}`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );

  return data?.cart ?? null;
}

export async function retrieveMedusaCart(
  cartId: string
): Promise<MedusaCart | null> {
  const data = await medusaStoreFetch<CartResponse>(
    `/store/carts/${cartId}${CART_QUERY}`
  );

  return data?.cart ?? null;
}

export async function addMedusaLineItem(
  cartId: string,
  payload: { variant_id: string; quantity: number }
): Promise<MedusaCart | null> {
  const data = await medusaStoreFetch<CartResponse>(
    `/store/carts/${cartId}/line-items${CART_QUERY}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return data?.cart ?? null;
}

export async function updateMedusaLineItem(
  cartId: string,
  lineId: string,
  payload: { quantity: number }
): Promise<MedusaCart | null> {
  const data = await medusaStoreFetch<CartResponse>(
    `/store/carts/${cartId}/line-items/${lineId}${CART_QUERY}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return data?.cart ?? null;
}

export async function deleteMedusaLineItem(
  cartId: string,
  lineId: string
): Promise<MedusaCart | null> {
  const data = await medusaStoreFetch<CartResponse>(
    `/store/carts/${cartId}/line-items/${lineId}${CART_QUERY}`,
    {
      method: 'DELETE',
    }
  );

  return data?.cart ?? null;
}

export async function completeMedusaCart(
  cartId: string
): Promise<MedusaOrder | null> {
  const data = await medusaStoreFetch<CompleteCartResponse>(
    `/store/carts/${cartId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );

  if (!data) {
    return null;
  }

  if (data.type === 'order') {
    if ('order' in data && data.order) {
      return data.order;
    }
    if (data.data && (data.data as MedusaOrder).id) {
      return data.data as MedusaOrder;
    }
  }

  if (data.order) {
    return data.order;
  }

  return null;
}

export function storeCartId(cartId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (cartId) {
    window.localStorage.setItem(CART_STORAGE_KEY, cartId);
  } else {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }
}

export function loadStoredCartId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(CART_STORAGE_KEY);
}
