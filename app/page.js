"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const router = useRouter();
  const { addToCart, totalItems, clearCartOnLogout } = useCart();
  const [products, setProducts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

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
        setUserRole(data.loggedIn ? data.user.role : null);
        setCheckingAuth(false);
      });

    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setWishlistIds(Array.isArray(data) ? data.map((p) => p._id) : []));
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2000);
  };

  const handleToggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const isSaved = wishlistIds.includes(product._id);

    if (isSaved) {
      await fetch(`/api/wishlist?productId=${product._id}`, { method: "DELETE" });
      setWishlistIds((prev) => prev.filter((id) => id !== product._id));
    } else {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      if (res.ok) setWishlistIds((prev) => [...prev, product._id]);
    }
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
        <Link href="/" className="logo-link">
          <h1>🛍️ My Shop</h1>
        </Link>
        <div>
          <Link href="/cart">🛒 Cart ({totalItems})</Link>
          {!checkingAuth && loggedIn && <Link href="/wishlist">❤️ Wishlist</Link>}
          {!checkingAuth && loggedIn && <Link href="/profile">My Profile</Link>}
          {!checkingAuth && loggedIn && userRole === "admin" && (
            <Link href="/admin">Manage Products</Link>
          )}
          {!checkingAuth && loggedIn && userRole === "admin" && (
            <Link href="/admin/orders">All Orders</Link>
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
                <div className="image-wrapper">
                  <img src={p.image || "https://via.placeholder.com/200"} alt={p.name} />
                  {loggedIn && (
                    <button
                      className={`wishlist-btn ${wishlistIds.includes(p._id) ? "active" : ""}`}
                      onClick={(e) => handleToggleWishlist(e, p)}
                    >
                      {wishlistIds.includes(p._id) ? "❤️" : "🤍"}
                    </button>
                  )}
                </div>
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