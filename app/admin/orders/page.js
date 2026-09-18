"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Shipped", "Completed", "Cancelled"];

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const[authChecked,setAuthChecked] = useState(false);

  const loadOrders = () => {
    fetch("/api/orders?all=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn || data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setAuthChecked(true);
      });
    loadOrders();
  }, []);


  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

   if (!authChecked) {
    return (
      <div className="container">
        <p>Checking access...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="navbar">
        <h1>📦 Admin - All Orders</h1>
        <div>
          <Link href="/">Back to Home</Link>
        </div>
      </nav>

      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && (
        <p className="empty-cart">No orders have been placed yet.</p>
      )}

      <div className="order-list">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <span className="order-date">
                {new Date(order.createdAt).toLocaleString()}
              </span>
              <span className="order-total">{order.total.toLocaleString()} baht</span>
            </div>

            <div className="order-meta">
              <span className="order-badge">
                {order.user?.email || order.user?.name || "Unknown user"}
              </span>
              <span className="order-badge">{order.paymentMethod}</span>
            </div>

            <div className="order-items">
              {order.items.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <img src={item.image || "https://via.placeholder.com/50"} alt={item.name} />
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-qty">x{item.qty}</span>
                  <span className="order-item-price">
                    {(item.price * item.qty).toLocaleString()} baht
                  </span>
                </div>
              ))}
            </div>

            <div className="status-control">
              <label>Status:</label>
              <select
                value={order.status}
                disabled={updatingId === order._id}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {updatingId === order._id && <span className="status-saving">Saving...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}