import { useState, useEffect } from 'react';

import type { CartItem, Coupon, Notification as TNotification, ProductWithUI } from '../types';
import Header from './components/Header';
import Notification from './components/Notification';
import { initialCoupons, initialProducts } from './constants';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';

// TODO: 메인 App 컴포넌트
// 힌트:
// 1. isAdmin 상태를 관리하여 쇼핑몰/관리자 모드 전환
// 2. 네비게이션 바에 모드 전환 버튼 포함
// 3. 조건부 렌더링으로 CartPage 또는 AdminPage 표시
// 4. 상태 관리는 각 페이지 컴포넌트에서 처리 (App은 라우팅만 담당)

const App = () => {
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('coupons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [totalItemCount, setTotalItemCount] = useState(0);

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {notifications.length > 0 && (
        <Notification notifications={notifications} setNotifications={setNotifications} />
      )}

      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        setDebouncedSearchTerm={setDebouncedSearchTerm}
        cart={cart}
        totalItemCount={totalItemCount}
      />

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {isAdmin ? (
          <AdminPage
            products={products}
            coupons={coupons}
            cart={cart}
            setProducts={setProducts}
            setCoupons={setCoupons}
            setNotifications={setNotifications}
          />
        ) : (
          <CartPage
            products={products}
            cart={cart}
            debouncedSearchTerm={debouncedSearchTerm}
            coupons={coupons}
            setCart={setCart}
            setNotifications={setNotifications}
          />
        )}
      </main>
    </div>
  );
};

export default App;
