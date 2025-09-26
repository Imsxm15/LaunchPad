'use client';

import { IconCircleCheck, IconTrash } from '@tabler/icons-react';
import React from 'react';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '../ui/animated-modal';
import { MediaImage } from '@/components/ui/media-image';
import { useCart } from '@/context/cart-context';
import { formatNumber } from '@/lib/utils';

export default function AddToCartModal({
  onClick,
}: {
  onClick: () => void;
}) {
  const {
    items,
    currencyCode,
    subtotal,
    total,
    updateQuantity,
    removeFromCart,
    checkout,
    lastOrder,
    error,
    isLoading,
    isUpdating,
    isProcessingCheckout,
  } = useCart();

  const currencySymbol = currencyCode?.toUpperCase() === 'EUR' ? '€' : '$';

  const handleQuantityChange = (lineItemId: string, value: number) => {
    if (Number.isNaN(value) || value < 0) {
      return;
    }
    void updateQuantity(lineItemId, value);
  };

  const handleRemove = (lineItemId: string) => {
    void removeFromCart(lineItemId);
  };

  const handleCheckout = () => {
    void checkout();
  };

  return (
    <Modal>
      <ModalTrigger
        onClick={onClick}
        disabled={isUpdating || isProcessingCheckout}
        className="mt-10 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdating ? 'Adding...' : 'Add to cart'}
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <h4 className="text-lg md:text-2xl text-neutral-600 font-bold text-center mb-6">
            {lastOrder ? 'Order confirmed' : 'Your cart'}
          </h4>

          {error && (
            <p className="text-center text-sm text-red-600 mb-4">{error}</p>
          )}

          {lastOrder ? (
            <OrderSummary currencySymbol={currencySymbol} order={lastOrder} />
          ) : (
            <CartItems
              items={items}
              isLoading={isLoading}
              currencySymbol={currencySymbol}
              onChangeQuantity={handleQuantityChange}
              onRemoveItem={handleRemove}
            />
          )}
        </ModalContent>
        {!lastOrder && (
          <ModalFooter className="gap-4 items-center">
            <div className="text-neutral-700 flex-1">
              <div className="text-xs uppercase text-neutral-500">Subtotal</div>
              <div className="font-semibold text-sm">
                {currencySymbol}
                {formatNumber(subtotal)}
              </div>
            </div>
            <div className="text-neutral-700 flex-1">
              <div className="text-xs uppercase text-neutral-500">Total</div>
              <div className="font-bold text-base">
                {currencySymbol}
                {formatNumber(total)}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!items.length || isProcessingCheckout || isUpdating}
              className="bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-2 rounded-md border border-black w-32"
            >
              {isProcessingCheckout ? 'Processing…' : 'Checkout'}
            </button>
          </ModalFooter>
        )}
      </ModalBody>
    </Modal>
  );
}

type CartItemsProps = {
  items: ReturnType<typeof useCart>['items'];
  isLoading: boolean;
  currencySymbol: string;
  onChangeQuantity: (lineItemId: string, value: number) => void;
  onRemoveItem: (lineItemId: string) => void;
};

const CartItems: React.FC<CartItemsProps> = ({
  items,
  isLoading,
  currencySymbol,
  onChangeQuantity,
  onRemoveItem,
}) => {
  if (isLoading) {
    return (
      <p className="text-center text-neutral-500">Loading your cart…</p>
    );
  }

  if (!items.length) {
    return (
      <p className="text-center text-neutral-700">
        Your cart is empty. Please add a product to continue.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-100">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-2 justify-between items-center py-4"
        >
          <div className="flex items-center gap-4">
            {item.thumbnail ? (
              <MediaImage
                src={item.thumbnail}
                alt={item.title}
                width={60}
                height={60}
                className="rounded-lg hidden md:block"
              />
            ) : (
              <div className="hidden md:block h-[60px] w-[60px] rounded-lg bg-neutral-200" />
            )}
            <div className="flex flex-col">
              <span className="text-black text-sm md:text-base font-medium">
                {item.title}
              </span>
              <span className="text-neutral-500 text-xs">
                {currencySymbol}
                {formatNumber(item.unitPrice)} each
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                onChangeQuantity(item.id, parseInt(e.target.value, 10))
              }
              min="1"
              step="1"
              className="w-16 p-2 h-full rounded-md focus:outline-none bg-neutral-50 border border-neutral-100 focus:bg-neutral-100 text-black mr-4"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
              }}
            />
            <div className="text-black text-sm font-medium w-20">
              {currencySymbol}
              {formatNumber(item.total)}
            </div>
            <button onClick={() => onRemoveItem(item.id)}>
              <IconTrash className="w-4 h-4 text-neutral-900" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

type OrderSummaryProps = {
  order: ReturnType<typeof useCart>['lastOrder'];
  currencySymbol: string;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({ order, currencySymbol }) => {
  if (!order) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 text-green-600">
        <IconCircleCheck className="h-5 w-5" />
        <span className="text-sm font-semibold">
          Thank you! Your order #{order.displayId ?? order.id} is confirmed.
        </span>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <div className="flex justify-between">
          <span className="font-medium">Total paid</span>
          <span className="font-semibold text-neutral-900">
            {currencySymbol}
            {formatNumber(order.total)}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>
                {currencySymbol}
                {formatNumber(item.total)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-xs text-neutral-500">
            Status: {order.status ?? 'pending'} · Payment:{' '}
            {order.paymentStatus ?? 'pending'} · Fulfilment:{' '}
            {order.fulfillmentStatus ?? 'pending'}
          </p>
          {order.trackingLinks.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-neutral-600">
                Tracking links
              </p>
              {order.trackingLinks.map((link) => (
                <a
                  key={`${link.url}-${link.trackingNumber ?? 'tracking'}`}
                  href={link.url}
                  className="text-xs text-blue-600 underline break-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.trackingNumber ?? link.url}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
