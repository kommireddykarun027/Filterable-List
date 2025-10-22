// src/components/ProductList.jsx
import React, { useMemo } from "react";

export default function ProductList({ products, filters }) {
  const filtered = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();
    return products
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .filter((p) => (filters.category ? p.category === filters.category : true))
      .filter(
        (p) => p.price >= (filters.minPrice || 0) && p.price <= (filters.maxPrice || 1000)
      );
  }, [products, filters]);

  if (filtered.length === 0) return <div className="card">No products match your filters.</div>;

  return (
    <div className="products-grid content">
      {filtered.map((p) => (
        <div key={p.id} className="card product-card">
          <div className="product-title">{p.name}</div>
          <div className="product-meta">{p.category}</div>
          <div className="product-price">${p.price}</div>
        </div>
      ))}
    </div>
  );
}
