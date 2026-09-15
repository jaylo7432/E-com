"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);
  const [ready, setReady] = useState(false);

  const loadCartForUser = (uid) => {
    if (!uid) {
      setCart([]);
      return;
    }
    const saved = localStorage.getItem(`cart_${uid}`);
    setCart(saved ? JSON.parse(saved) : []);
  };

  // เช็คว่าตอนนี้ login เป็นใคร แล้วโหลดตะกร้าของคนนั้น
  const syncUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const uid = data.loggedIn ? data.user.id : null;
      setUserId(uid);
      loadCartForUser(uid);
    } catch {
      setUserId(null);
      setCart([]);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    syncUser();
  }, []);

  // บันทึกตะกร้าลง localStorage เฉพาะตอนมี user login อยู่
  useEffect(() => {
    if (ready && userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId, ready]);

  const addToCart = (product) => {
    if (!userId) return;
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  // เรียกหลัง login สำเร็จ เพื่อโหลดตะกร้าของบัญชีนั้น
  const refreshCartUser = () => {
    syncUser();
  };

  // เรียกตอน logout เพื่อล้างตะกร้าที่แสดงอยู่ (ข้อมูลใน localStorage ของ user เดิมยังอยู่)
  const clearCartOnLogout = () => {
    setUserId(null);
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        refreshCartUser,
        clearCartOnLogout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}