"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        setCheckingAuth(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h1>🛍️ My Shop</h1>
        <div>
          <Link href="/cart">🛒 Cart ({totalItems})</Link>
          {!checkingAuth && loggedIn && <Link href="/admin">Edit Products</Link>}
          {!checkingAuth && loggedIn && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
          {!checkingAuth && !loggedIn && <Link href="/login">Login</Link>}
          {!checkingAuth && !loggedIn && <Link href="/register">Register</Link>}
        </div>
      </nav>

      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p._id}>
            <img src={p.image || "https://via.placeholder.com/200"} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="price">{p.price.toLocaleString()} bath</p>
            <p className="desc">{p.description}</p>
            <button onClick={() => addToCart(p)}>add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}