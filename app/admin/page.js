"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "", stock: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({ name: "", price: "", description: "", image: "", stock: "" });
    setEditingId(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Failed to upload image");
      return;
    }

    setForm((prev) => ({ ...prev, image: data.url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      image: form.image,
      stock: Number(form.stock) || 0,
    };

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong, please login first");
      return;
    }

    resetForm();
    loadProducts();
  };

  const handleEditClick = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description || "",
      image: p.image || "",
      stock: String(p.stock ?? 0),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Confirm delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) resetForm();
      loadProducts();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete");
    }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h1>🛠️ Admin - Manage Products</h1>
        <div>
          <Link href="/">Back to Home</Link>
        </div>
      </nav>

      <div className="admin-layout">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
          {error && <p className="error">{error}</p>}

          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price (baht)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <textarea
            placeholder="Product description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Image upload section */}
          <label className="upload-label">
            {uploading ? "Uploading..." : "Choose image from device"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>

          {form.image && (
            <img src={form.image} alt="preview" className="image-preview" />
          )}

          <input
            type="number"
            placeholder="Stock quantity"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          <button type="submit" disabled={loading || uploading}>
            {loading ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
          </button>

          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="admin-list">
          <h2>All Products ({products.length})</h2>
          {products.map((p) => (
            <div className="admin-product-row" key={p._id}>
              <img src={p.image || "https://via.placeholder.com/60"} alt={p.name} />
              <div className="admin-product-info">
                <strong>{p.name}</strong>
                <span>{p.price.toLocaleString()} baht | Stock: {p.stock}</span>
              </div>
              <button className="edit-btn" onClick={() => handleEditClick(p)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(p._id)}>
                Delete
              </button>
            </div>
          ))}
          {products.length === 0 && <p>No products found</p>}
        </div>
      </div>
    </div>
  );
}