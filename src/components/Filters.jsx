// src/components/Filters.jsx
import React, { useEffect, useState } from "react";

export default function Filters({ categories, filters, onChange }) {
  const [local, setLocal] = useState(filters);

  useEffect(() => setLocal(filters), [filters]);

  function update(part) {
    const next = { ...local, ...part };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="card filters">
      <div className="mb-2">
        <label>Search by name</label>
        <input
          className="input"
          value={local.q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Type product name..."
        />
      </div>

      <div className="mb-2">
        <label>Category</label>
        <select
          className="select"
          value={local.category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label>Price range (min - max)</label>
        <div className="row">
          <input
            type="number"
            className="num"
            value={local.minPrice}
            onChange={(e) => update({ minPrice: Number(e.target.value) })}
            min={0}
          />
          <input
            type="number"
            className="num"
            value={local.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div className="small mt-2">You can type numbers. Default range 0 - 1000.</div>
      </div>
    </div>
  );
}
