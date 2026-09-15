
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          window.location.href = "/login";
          return;
        }

        setUser(data.user);
      });

    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <nav className="navbar">
        <h1>👤 My Profile</h1>

        <div>
          <Link href="/">Back to home</Link>
        </div>
      </nav>

      {user && (
        <div className="profile-card">
          <div className="Profile-avatar">
            {user.email?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
      )}

      <h2 className="section-title">Order History</h2>

      {loading && <p>Loading order..</p>}

      {!loading && orders.length === 0 && (
        <p className="empty-cart">
          You haven't placed any order yet
        </p>
      )}

      <div className="order-list">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <span className="order-date">
                {new Date(order.createdAt).toLocaleString()}
              </span>

              <span className="Order-total">
                {order.total.toLocaleString()} Bath
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/50"
                    }
                    alt={item.name}
                  />

                  <span className="order-item-name">
                    {item.name}
                  </span>

                  <span className="order-item-qty">
                    x{item.qty}
                  </span>

                  <span className="order-item-price">
                    {(item.price * item.qty).toLocaleString()} baht
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

