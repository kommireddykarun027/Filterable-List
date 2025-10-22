// src/components/PaginatedList.jsx
import React, { useEffect, useState } from "react";

export default function PaginatedList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pageSize = 5;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${pageSize}`)
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((data) => { if (cancelled) return; setItems((prev) => [...prev, ...data]); })
      .catch((err) => { if (cancelled) return; setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="card mt-2">
      <h3>Paginated posts (Load More)</h3>
      <ul>
        {items.map((it) => (
          <li key={it.id} className="mt-2"><strong>{it.id}.</strong> {it.title}</li>
        ))}
      </ul>

      {error && <div className="text-red">Error: {error.message}</div>}

      <div className="mt-2">
        <button onClick={() => setPage((p) => p + 1)} className="btn" disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
        <span className="small ml-2">Current page: {page}</span>
      </div>
    </div>
  );
}
