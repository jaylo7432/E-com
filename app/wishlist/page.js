"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const loadWishlist = () => {
    fetch("/api/wishlist", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <Link href="/" className="logo-link">
          <h1>❤️ My Wishlist</h1>
        </Link>
        <div>
          <Link href="/">Back to Home</Link>
        </div>
      </nav>

      {loading && <p>Loading wishlist...</p>}
      {!loading && items.length === 0 && (
        <p className="empty-cart">Your wishlist is empty. Go add some favorites!</p>
      )}

      <div className="product-grid">
        {items.map((p) => (
          <div className="product-card" key={p._id}>
            <Link href={`/product/${p._id}`} className="product-link">
              <img src={p.image || "https://via.placeholder.com/200"} alt={p.name} />
              <span className="category-tag">{p.category || "General"}</span>
              <h3>{p.name}</h3>
            </Link>
            <p className="price">{p.price.toLocaleString()} baht</p>
            <p className="desc">{p.description}</p>
            <div className="wishlist-actions">
              <button onClick={() => handleAddToCart(p)}>Add to Cart</button>
              <button className="delete-btn" onClick={() => handleRemove(p._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="toast">
          <span className="toast-icon">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}