import React, { useCallback, useState } from 'react';

import Cart from './Cart';
import { CartItem, Coupon, ProductWithUI } from '../../types';

type TPaymentSectionProps = {
  products: ProductWithUI[];
  cart: CartItem[];
  coupons: Coupon[];
  updateQuantity: (productId: string, newQuantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addNotification: (message: string, type: 'error' | 'success' | 'warning') => void;
};

export default function PaymentSection(props: TPaymentSectionProps) {
  const { products, cart, coupons, updateQuantity, removeFromCart, clearCart, addNotification } =
    props;

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const getMaxApplicableDiscount = (item: CartItem): number => {
    const { discounts } = item.product;
    const { quantity } = item;

    const baseDiscount = discounts.reduce((maxDiscount, discount) => {
      return quantity >= discount.quantity && discount.rate > maxDiscount
        ? discount.rate
        : maxDiscount;
    }, 0);

    const hasBulkPurchase = cart.some((cartItem) => cartItem.quantity >= 10);
    if (hasBulkPurchase) {
      return Math.min(baseDiscount + 0.05, 0.5); // 대량 구매 시 추가 5% 할인
    }

    return baseDiscount;
  };

  const calculateItemTotal = (item: CartItem): number => {
    const { price } = item.product;
    const { quantity } = item;
    const discount = getMaxApplicableDiscount(item);

    return Math.round(price * quantity * (1 - discount));
  };

  const calculateCartTotal = (): {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
  } => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    cart.forEach((item) => {
      const itemPrice = item.product.price * item.quantity;
      totalBeforeDiscount += itemPrice;
      totalAfterDiscount += calculateItemTotal(item);
    });

    if (selectedCoupon) {
      if (selectedCoupon.discountType === 'amount') {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount = Math.round(
          totalAfterDiscount * (1 - selectedCoupon.discountValue / 100),
        );
      }
    }

    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount),
    };
  };

  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal().totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === 'percentage') {
        addNotification('percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.', 'error');
        return;
      }

      setSelectedCoupon(coupon);
      addNotification('쿠폰이 적용되었습니다.', 'success');
    },
    [addNotification, calculateCartTotal],
  );

  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, 'success');
    clearCart();
  }, [addNotification]);

  const totals = calculateCartTotal();

  return (
    <div className='sticky top-24 space-y-4'>
      <Cart
        products={products}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        calculateItemTotal={calculateItemTotal}
        addNotification={addNotification}
      />

      {cart.length > 0 && (
        <>
          <section className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-sm font-semibold text-gray-700'>쿠폰 할인</h3>
              <button className='text-xs text-blue-600 hover:underline'>쿠폰 등록</button>
            </div>
            {coupons.length > 0 && (
              <select
                className='w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
                value={selectedCoupon?.code || ''}
                onChange={(e) => {
                  const coupon = coupons.find((c) => c.code === e.target.value);
                  if (coupon) applyCoupon(coupon);
                  else setSelectedCoupon(null);
                }}
              >
                <option value=''>쿠폰 선택</option>
                {coupons.map((coupon) => (
                  <option key={coupon.code} value={coupon.code}>
                    {coupon.name} (
                    {coupon.discountType === 'amount'
                      ? `${coupon.discountValue.toLocaleString()}원`
                      : `${coupon.discountValue}%`}
                    )
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className='bg-white rounded-lg border border-gray-200 p-4'>
            <h3 className='text-lg font-semibold mb-4'>결제 정보</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>상품 금액</span>
                <span className='font-medium'>{totals.totalBeforeDiscount.toLocaleString()}원</span>
              </div>
              {totals.totalBeforeDiscount - totals.totalAfterDiscount > 0 && (
                <div className='flex justify-between text-red-500'>
                  <span>할인 금액</span>
                  <span>
                    -{(totals.totalBeforeDiscount - totals.totalAfterDiscount).toLocaleString()}원
                  </span>
                </div>
              )}
              <div className='flex justify-between py-2 border-t border-gray-200'>
                <span className='font-semibold'>결제 예정 금액</span>
                <span className='font-bold text-lg text-gray-900'>
                  {totals.totalAfterDiscount.toLocaleString()}원
                </span>
              </div>
            </div>

            <button
              onClick={completeOrder}
              className='w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-md font-medium hover:bg-yellow-500 transition-colors'
            >
              {totals.totalAfterDiscount.toLocaleString()}원 결제하기
            </button>

            <div className='mt-3 text-xs text-gray-500 text-center'>
              <p>* 실제 결제는 이루어지지 않습니다</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
