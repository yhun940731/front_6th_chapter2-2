import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import Cart from './Cart';
import { CartItem, Coupon } from '../../types';
import CouponSection from '../components/payment/CouponSection';
import PaymentSummary from '../components/payment/PaymentSummary';
import {
  cartAtom,
  clearCartAtom,
  couponsAtom,
  selectedCouponAtom,
  updateQuantityAtom,
  removeFromCartAtom,
} from '../store/atoms';
import {
  calculateCartTotal,
  calculateItemTotal as calculateSingleItemTotal,
  validateCouponUsage,
} from '../utils/PaymentCalculator';

type TPaymentSectionProps = {
  addNotification: (message: string, type: 'error' | 'success' | 'warning') => void;
};

export default function PaymentSection(props: TPaymentSectionProps) {
  const { addNotification } = props;
  const [cart] = useAtom(cartAtom);
  const [coupons] = useAtom(couponsAtom);
  const [selectedCoupon, setSelectedCoupon] = useAtom(selectedCouponAtom);
  const updateQuantity = useSetAtom(updateQuantityAtom);
  const removeFromCart = useSetAtom(removeFromCartAtom);
  const clearCart = useSetAtom(clearCartAtom);

  const applyCoupon = useCallback(
    (coupon: Coupon | null) => {
      if (!coupon) {
        setSelectedCoupon(null);
        return;
      }

      const currentTotal = calculateCartTotal(cart).totalAfterDiscount;

      if (!validateCouponUsage(coupon, currentTotal)) {
        addNotification('percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.', 'error');
        return;
      }

      setSelectedCoupon(coupon);
      addNotification('쿠폰이 적용되었습니다.', 'success');
    },
    [addNotification, cart, setSelectedCoupon],
  );

  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, 'success');
    clearCart();
    setSelectedCoupon(null);
  }, [addNotification, clearCart]);

  const totals = calculateCartTotal(cart, selectedCoupon);

  const calculateItemTotal = useCallback(
    (item: CartItem): number => {
      return calculateSingleItemTotal(item, cart);
    },
    [cart],
  );

  return (
    <div className='sticky top-24 space-y-4'>
      <Cart
        cart={cart}
        updateQuantity={(productId, newQuantity) =>
          updateQuantity({ productId, quantity: newQuantity })
        }
        removeFromCart={removeFromCart}
        calculateItemTotal={calculateItemTotal}
        addNotification={addNotification}
      />

      {cart.length > 0 && (
        <>
          <CouponSection
            coupons={coupons}
            selectedCoupon={selectedCoupon}
            onCouponSelect={applyCoupon}
          />

          <PaymentSummary totals={totals} onCompleteOrder={completeOrder} />
        </>
      )}
    </div>
  );
}
