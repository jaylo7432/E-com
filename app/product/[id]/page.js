"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState("");
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(setProduct)
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    fetch(`/api/products/${id}/reviews`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setReviews);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setLoggedIn(data.loggedIn));
  }, [id]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const renderStars = (value) => {
    const rounded = Math.round(value);
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setSubmittingReview(true);

    const res = await fetch(`/api/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: ratingInput, comment: commentInput }),
    });

    const data = await res.json();
    setSubmittingReview(false);

    if (!res.ok) {
      setReviewError(data.error || "Failed to submit review");
      return;
    }

    setReviews((prev) => [data, ...prev]);
    setCommentInput("");
    setRatingInput(5);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setToast(`Added ${qty} x "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2000);
  };

  if (notFound) {
    return (
      <div className="container">
        <nav className="navbar">
          <h1>🛍️ My Shop</h1>
          <div>
            <Link href="/">Back to Home</Link>
          </div>
        </nav>
        <p className="empty-cart">Product not found.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <nav className="navbar">
          <h1>🛍️ My Shop</h1>
          <div>
            <Link href="/">Back to Home</Link>
          </div>
        </nav>
        <div className="product-detail-layout">
          <div className="skeleton-shimmer" style={{ height: 360, borderRadius: 14 }} />
          <div>
            <div className="skeleton-shimmer skeleton-line" style={{ height: 28, width: "60%" }} />
            <div className="skeleton-shimmer skeleton-line" style={{ marginTop: 16 }} />
            <div className="skeleton-shimmer skeleton-line short" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="navbar">
        <h1>🛍️ My Shop</h1>
        <div>
          <Link href="/">Back to Home</Link>
        </div>
      </nav>

      <div className="product-detail-layout">
        <img
          src={product.image || "https://via.placeholder.com/500"}
          alt={product.name}
          className="detail-image"
        />

        <div className="detail-info">
          <span className="category-tag">{product.category || "General"}</span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">{product.price.toLocaleString()} baht</p>
          <p className="detail-stock">
            {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
          </p>
          <p className="detail-rating">
            {avgRating
              ? `${renderStars(avgRating)} ${avgRating} (${reviews.length} review${reviews.length > 1 ? "s" : ""})`
              : "No reviews yet"}
          </p>
          <p className="detail-desc">{product.description || "No description provided."}</p>

          <div className="qty-control detail-qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          <button
            className="checkout-btn"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {loggedIn ? (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            {reviewError && <p className="error">{reviewError}</p>}
            <label>
              Your rating:
              <select value={ratingInput} onChange={(e) => setRatingInput(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </label>
            <textarea
              placeholder="Share your thoughts about this product..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button type="submit" disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className="review-login-hint">
            <Link href="/login">Login</Link> to write a review.
          </p>
        )}

        <div className="review-list">
          {reviews.length === 0 && <p>No reviews yet. Be the first to review this product!</p>}
          {reviews.map((r) => (
            <div className="review-item" key={r._id}>
              <div className="review-header">
                <strong>{r.userName}</strong>
                <span className="review-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
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