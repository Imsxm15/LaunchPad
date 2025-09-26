'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  MedusaCart,
  MedusaLineItem,
  MedusaOrder,
  addMedusaLineItem,
  completeMedusaCart,
  createMedusaCart,
  deleteMedusaLineItem,
  loadStoredCartId,
  retrieveMedusaCart,
  storeCartId,
  updateMedusaLineItem,
} from '@/lib/medusa/cart';
import { Product } from '@/types/types';

const DEFAULT_CURRENCY = 'usd';

type CartItem = {
  id: string;
  title: string;
  description?: string | null;
  quantity: number;
  thumbnail?: string | null;
  unitPrice: number;
  total: number;
  variantId: string;
  productId: string;
  currencyCode: string;
};

type TrackingLink = {
  url: string;
  trackingNumber?: string | null;
};

type OrderSummary = {
  id: string;
  displayId?: number;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  createdAt?: string;
  currencyCode: string;
  subtotal: number;
  total: number;
  items: CartItem[];
  trackingLinks: TrackingLink[];
};

type NormalisedCart = {
  id: string;
  items: CartItem[];
  currencyCode: string;
  subtotal: number;
  total: number;
};

type CartContextType = {
  cartId: string | null;
  items: CartItem[];
  currencyCode: string;
  subtotal: number;
  total: number;
  isLoading: boolean;
  isUpdating: boolean;
  isProcessingCheckout: boolean;
  error: string | null;
  lastOrder: OrderSummary | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<OrderSummary | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function normaliseAmount(value?: number | null): number {
  if (!value) {
    return 0;
  }
  return value >= 100 ? value / 100 : value;
}

function mapLineItem(
  item: MedusaLineItem,
  currencyCode: string
): CartItem {
  const subtotal = item.total ?? item.subtotal ?? item.unit_price * item.quantity;

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    quantity: item.quantity,
    thumbnail: item.thumbnail ?? undefined,
    unitPrice: normaliseAmount(item.unit_price),
    total: normaliseAmount(subtotal),
    variantId: item.variant_id,
    productId: item.product_id,
    currencyCode,
  };
}

function calculateItemsTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.total, 0);
}

function normaliseCart(cart: MedusaCart): NormalisedCart {
  const currencyCode = cart.region?.currency_code ?? DEFAULT_CURRENCY;
  const items = (cart.items ?? []).map((item) =>
    mapLineItem(item, currencyCode)
  );

  const subtotal = cart.subtotal
    ? normaliseAmount(cart.subtotal)
    : calculateItemsTotal(items);
  const total = cart.total
    ? normaliseAmount(cart.total)
    : calculateItemsTotal(items);

  return {
    id: cart.id,
    items,
    currencyCode,
    subtotal,
    total,
  };
}

function normaliseOrder(order: MedusaOrder): OrderSummary {
  const currencyCode = order.currency_code ?? DEFAULT_CURRENCY;
  const items = (order.items ?? []).map((item) =>
    mapLineItem(item, currencyCode)
  );
  const subtotal = order.subtotal
    ? normaliseAmount(order.subtotal)
    : calculateItemsTotal(items);
  const total = order.total
    ? normaliseAmount(order.total)
    : calculateItemsTotal(items);

  const trackingLinks = (order.fulfillments ?? [])
    .flatMap((fulfillment) => fulfillment.tracking_links ?? [])
    .filter((link) => Boolean(link?.url))
    .map((link) => ({
      url: link.url as string,
      trackingNumber: link.tracking_number ?? null,
    }));

  return {
    id: order.id,
    displayId: order.display_id,
    status: order.status,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    createdAt: order.created_at,
    currencyCode,
    subtotal,
    total,
    items,
    trackingLinks,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<NormalisedCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderSummary | null>(null);

  const loadExistingCart = useCallback(async () => {
    const storedId = loadStoredCartId();
    if (!storedId) {
      setCart(null);
      return null;
    }

    const existingCart = await retrieveMedusaCart(storedId);
    if (!existingCart) {
      storeCartId(null);
      setCart(null);
      return null;
    }

    const normalised = normaliseCart(existingCart);
    setCart(normalised);
    storeCartId(normalised.id);
    return normalised;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const existing = await loadExistingCart();
        if (cancelled) {
          return;
        }
        if (existing) {
          setCart(existing);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadExistingCart]);

  const ensureCart = useCallback(async (): Promise<NormalisedCart> => {
    setError(null);

    if (cart) {
      return cart;
    }

    const existing = await loadExistingCart();
    if (existing) {
      return existing;
    }

    const created = await createMedusaCart();
    if (!created) {
      throw new Error('Unable to create a shopping cart. Please try again.');
    }

    const normalised = normaliseCart(created);
    storeCartId(normalised.id);
    setCart(normalised);
    return normalised;
  }, [cart, loadExistingCart]);

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      if (!product?.plans?.length) {
        setError('This product is currently unavailable.');
        return;
      }

      setIsUpdating(true);
      setLastOrder(null);

      try {
        const currentCart = await ensureCart();
        const variantId = product.plans?.[0]?.id;

        if (!variantId) {
          throw new Error('Missing product variant.');
        }

        const updatedCart = await addMedusaLineItem(currentCart.id, {
          variant_id: variantId,
          quantity,
        });

        if (!updatedCart) {
          throw new Error('Unable to add the product to the cart.');
        }

        const normalised = normaliseCart(updatedCart);
        storeCartId(normalised.id);
        setCart(normalised);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to add the product to the cart.'
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [ensureCart]
  );

  const removeFromCart = useCallback(
    async (lineItemId: string) => {
      if (!cart) {
        return;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updatedCart = await deleteMedusaLineItem(cart.id, lineItemId);

        if (!updatedCart) {
          throw new Error('Unable to remove the item.');
        }

        const normalised = normaliseCart(updatedCart);
        setCart(normalised);
        if (!normalised.items.length) {
          storeCartId(normalised.id);
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to remove the item from the cart.'
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [cart]
  );

  const updateQuantity = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!lineItemId || quantity < 0) {
        return;
      }

      if (quantity === 0) {
        await removeFromCart(lineItemId);
        return;
      }

      if (!cart) {
        return;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updatedCart = await updateMedusaLineItem(cart.id, lineItemId, {
          quantity,
        });

        if (!updatedCart) {
          throw new Error('Unable to update the quantity.');
        }

        const normalised = normaliseCart(updatedCart);
        setCart(normalised);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to update the quantity.'
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [cart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    setCart(null);
    setLastOrder(null);
    storeCartId(null);
  }, []);

  const checkout = useCallback(async () => {
    setError(null);

    const activeCart = cart ?? (await loadExistingCart());

    if (!activeCart || !activeCart.items.length) {
      setError('Your cart is currently empty.');
      return null;
    }

    setIsProcessingCheckout(true);

    try {
      const order = await completeMedusaCart(activeCart.id);

      if (!order) {
        throw new Error(
          'We could not finalise your order. Please try again in a moment.'
        );
      }

      const normalisedOrder = normaliseOrder(order);
      setLastOrder(normalisedOrder);
      await clearCart();
      return normalisedOrder;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'We could not finalise your order. Please try again in a moment.'
      );
      return null;
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [cart, clearCart, loadExistingCart]);

  const value = useMemo<CartContextType>(
    () => ({
      cartId: cart?.id ?? null,
      items: cart?.items ?? [],
      currencyCode: cart?.currencyCode ?? DEFAULT_CURRENCY,
      subtotal: cart?.subtotal ?? 0,
      total: cart?.total ?? 0,
      isLoading,
      isUpdating,
      isProcessingCheckout,
      error,
      lastOrder,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      checkout,
    }),
    [
      cart,
      isLoading,
      isUpdating,
      isProcessingCheckout,
      error,
      lastOrder,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      checkout,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
