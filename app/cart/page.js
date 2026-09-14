"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice } = useCart();

  const handleCheckout = () => {
    alert("order successful ");
    clearCart();
  };


  return (
    <div className="container">
 

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
            <button className="checkout-btn" onClick={handleCheckout}>
              order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}     <nav className="navbar">
        <h1>🛒 Cart</h1>
        <div>
          <Link href="/">Home</Link>
        </div>
      </nav>