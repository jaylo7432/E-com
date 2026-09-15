"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const [placing, setPlacing] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");

  const handleCheckout = async () => {
    setPlacing(true);
    setOrderMsg("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
        })),
        total: totalPrice,
      }),
    });

    setPlacing(false);
    if (!res.ok) {
      const data = await res.json();
      setOrderMsg(data.error || "please login to place an order");
      return;
    }
    clearCart();
    setOrderMsg("Order placed successfully! check your profile for order history.");
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h1>🛒 Cart</h1>
        <div>
          <Link href="/">Home</Link>
        </div>
      </nav>

      {cart.length === 0 ? (
        <p className="empty-cart">There are no items in the cart</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-row" key={item._id}>
                <img src={item.image || "https://via.placeholder.com/70"} alt={item.name} />
                <div className="cart-info">
                  <strong>{item.name}</strong>
                  <span>{item.price.toLocaleString()} bath</span>
                </div>
                <div className="qty-control">
                  <button onClick={() => updateQty(item._id, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                </div>
                <span className="row-total">{(item.price * item.qty).toLocaleString()} bath</span>
                <button className="delete-btn" onClick={() => removeFromCart(item._id)}>
                  delete
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>total</h2>
            <p className="total-price">total: {totalPrice.toLocaleString()} bath</p>
            {orderMsg && <p className="order-msg">{orderMsg}</p>}
            <button className="checkout-btn" onClick={handleCheckout} disabled={placing}>
              {placing ? "Placing order..." : "Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}