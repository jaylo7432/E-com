"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const router = useRouter();
  const { addToCart, totalItems,clearCartOnLogout } = useCart();
  const [products, setProducts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      });

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        setCheckingAuth(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    clearCartOnLogout();
    router.push("/");
    router.refresh();
  };

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category || "General"));
    return ["All", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        category === "All" || (p.category || "General") === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, search, category]);

  return (
    <div className="container">
      <nav className="navbar">
        <h1>🛍️ My Shop</h1>
        <div>
          <Link href="/cart">🛒 Cart ({totalItems})</Link>
          {!checkingAuth && loggedIn && (
            <Link href="/profile">My Profile</Link>
          )}
          {!checkingAuth && loggedIn && (
            <Link href="/admin">Manage Products</Link>
          )}
          {!checkingAuth && loggedIn && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
          {!checkingAuth && !loggedIn && <Link href="/login">Login</Link>}
          {!checkingAuth && !loggedIn && <Link href="/register">Register</Link>}
        </div>
      </nav>

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {!loadingProducts &&
          filteredProducts.map((p) => (
            <div className="product-card" key={p._id}>

            <Link href={`/product/${p._id}`} className="product-link">
              <img src={p.image || "https://via.placeholder.com/200"} alt={p.name} />
              <span className="category-tag">{p.category || "General"}</span>
              <h3>{p.name}</h3>
              {p.reviewCount > 0 && (
                <p className="card-rating">
                  {"★".repeat(Math.round(p.avgRating))}
                  {"☆".repeat(5 - Math.round(p.avgRating))} ({p.reviewCount})
                </p>
              )}
              
            </Link>
              <p className="price">{p.price.toLocaleString()} baht</p>
              <p className="desc">{p.description}</p>
              <button onClick={() => handleAddToCart(p)}>Add to Cart</button>
            </div>
          ))}

        {!loadingProducts && filteredProducts.length === 0 && (
          <p>No products match your search.</p>
        )}

        {loadingProducts &&
          Array.from({ length: 4 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-shimmer skeleton-img" />
              <div className="skeleton-shimmer skeleton-line" />
              <div className="skeleton-shimmer skeleton-line short" />
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