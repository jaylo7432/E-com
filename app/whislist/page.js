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

  useEffect(() =>{
    loadWishlist();
  },[]);

  const handleRemove = async(productId) =>{
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((p) => p._id !== productId));
  };
  const handleAddToCart =(product) => {
    addToCart(product);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""),2000);
  };

  return(
    <div className="Container">
        <nav className="navbar">
            <Link href="/" className="logo-link">
            </Link>
            <h1>❤️ My Wishlist</h1>
            <div>
                <Link href="/">Back to home</Link>
            </div>
        </nav>
    </div>
  ) 

  }
