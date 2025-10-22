
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";



const styles = `
:root{
  --max-width: 1024px;
  --bg: #f9fafb;
  --card: #ffffff;
  --muted: #6b7280;
  --accent: #2563eb;
  --border: #e5e7eb;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
/* Force a light color scheme so browser dark-mode or extensions don't invert colors */
html,body{color-scheme:light}
body{font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; background:var(--bg) !important; color:#111827}
.container{max-width:var(--max-width); margin:24px auto; padding:18px}
.header{margin-bottom:18px}
.h1{font-size:20px; font-weight:700}
.sub{color:var(--muted); font-size:13px}
.filters{background:var(--card); border:1px solid var(--border); padding:12px; border-radius:10px}
.filters label{display:block; font-size:13px; margin-bottom:6px; color:#111827}
.input, .select, .num{width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--border); font-size:14px; background:#fff; color:#111827}
/* Fix autofill dark background in Chrome: */
.input:-webkit-autofill, .select:-webkit-autofill, .num:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px #fff inset !important;
  -webkit-text-fill-color: #111827 !important;
}
.flex{display:flex}
.gap-2{gap:8px}
.mb-2{margin-bottom:12px}
.grid{display:grid; gap:12px}
.products-grid{grid-template-columns:repeat(1, minmax(0,1fr))}
.card{background:var(--card); padding:12px; border:1px solid var(--border); border-radius:10px; box-shadow:0 1px 2px rgba(0,0,0,0.03)}
.card h3{margin:0 0 6px 0; font-size:15px}
.card p{margin:0; color:var(--muted); font-size:13px}
.small{font-size:12px; color:var(--muted)}
.btn{background:transparent; border:1px solid var(--border); padding:8px 10px; border-radius:8px; cursor:pointer}
.btn:disabled{opacity:0.6; cursor:not-allowed}
.footer{margin-top:22px; font-size:12px; color:var(--muted)}

/* Responsive grid */
@media(min-width:640px){
  .products-grid{grid-template-columns:repeat(2, minmax(0,1fr))}
}
@media(min-width:1000px){
  .products-grid{grid-template-columns:repeat(3, minmax(0,1fr))}
}

/* Layout tweaks */
.controls-row{display:flex; flex-direction:column; gap:10px}
@media(min-width:720px){
  .controls-row{flex-direction:row; align-items:center}
  .controls-row .filters{flex:1}
}

/* Small helpers */
.center{display:flex; align-items:center}
.ml-2{margin-left:8px}
.mt-2{margin-top:8px}
.text-red{color:#b91c1c}
`;



const globalCache = new Map();

function useFetch(url) {
  const [data, setData] = useState(() => globalCache.get(url) || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  const fetchData = useCallback(() => {
    if (!url) return;

  
    if (globalCache.has(url)) {
      setData(globalCache.get(url));
      setError(null);
      setLoading(false);
      return;
    }

 
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        globalCache.set(url, json);
        setData(json);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    if (!url) return;
    fetchData();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [url, fetchData]);

  const retry = useCallback(() => {
    
    globalCache.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, error, loading, retry };
}



const MOCK_PRODUCTS = [
  { id: 1, name: "Classic Laptop", category: "Electronics", price: 999 },
  { id: 2, name: "Running Shoes", category: "Fashion", price: 75 },
  { id: 3, name: "Bluetooth Headphones", category: "Electronics", price: 120 },
  { id: 4, name: "Coffee Mug", category: "Home", price: 15 },
  { id: 5, name: "Office Chair", category: "Home", price: 180 },
  { id: 6, name: "Graphic T-Shirt", category: "Fashion", price: 25 },
  { id: 7, name: "Smart Watch", category: "Electronics", price: 220 },
  { id: 8, name: "Notebook", category: "Stationery", price: 5 },
  { id: 9, name: "Ballpoint Pen", category: "Stationery", price: 2 },
  { id: 10, name: "Desk Lamp", category: "Home", price: 40 },
];



function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : 0,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : 1000,
  };
}

function writeFiltersToURL(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (typeof filters.minPrice === "number") params.set("minPrice", filters.minPrice);
  if (typeof filters.maxPrice === "number") params.set("maxPrice", filters.maxPrice);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", url);
}



function Filters({ categories, filters, onChange }) {
  const [local, setLocal] = useState(filters);

  useEffect(() => setLocal(filters), [filters]);

  function update(part) {
    const next = { ...local, ...part };
    setLocal(next);
    onChange(next);
  }

  return (
    <div>
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
        <label>Price range</label>
        <div className="flex gap-2 center">
          <input
            type="number"
            className="num"
            value={local.minPrice}
            onChange={(e) => update({ minPrice: Number(e.target.value) })}
            min={0}
          />
          <div className="small">-</div>
          <input
            type="number"
            className="num"
            value={local.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div className="small mt-2">Type values directly. These fields are forgiving for freshers.</div>
      </div>
    </div>
  );
}



function ProductList({ products, filters }) {
  const filtered = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();
    return products
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .filter((p) => (filters.category ? p.category === filters.category : true))
      .filter((p) => p.price >= (filters.minPrice || 0) && p.price <= (filters.maxPrice || 1000));
  }, [products, filters]);

  if (filtered.length === 0) {
    return <div className="card">No products match your filters.</div>;
  }

  return (
    <div className="grid products-grid">
      {filtered.map((p) => (
        <div key={p.id} className="card">
          <h3>{p.name}</h3>
          <p className="small">{p.category}</p>
          <p className="mt-2"><strong>${p.price}</strong></p>
        </div>
      ))}
    </div>
  );
}



function PostList() {
  const url = "https://httpbin.org/delay/2?query=abcd";
  const { data, error, loading, retry } = useFetch(url);

  return (
    <div className="card mt-2">
      <h2 style={{marginBottom:8}}>PostList (demo using httpbin)</h2>

      {loading && <div className="small">Loading posts... (simulated delay)</div>}

      {error && (
        <div className="small text-red">Error loading posts: {error.message}
          <div className="mt-2">
            <button onClick={retry} className="btn">Retry</button>
          </div>
        </div>
      )}

      {data && (
        <div className="small mt-2">
          <div>Response fields:</div>
          <ul>
            {Object.keys(data).map((k) => (
              <li key={k}><strong>{k}</strong>: {typeof data[k] === "object" ? JSON.stringify(data[k]) : String(data[k])}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



function PaginatedList() {
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
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setItems((prev) => [...prev, ...data]);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="card mt-2">
      <h2 style={{marginBottom:8}}>Paginated posts (Load More)</h2>

      <ul>
        {items.map((it) => (
          <li key={it.id} className="mb-2"><strong>{it.id}.</strong> {it.title}</li>
        ))}
      </ul>

      {error && <div className="text-red">Error: {error.message}</div>}

      <div className="mt-2 center">
        <button onClick={() => setPage((p) => p + 1)} className="btn" disabled={loading}>{loading ? "Loading..." : "Load More"}</button>
        <div className="ml-2 small">Current page: {page}</div>
      </div>
    </div>
  );
}



export default function App() {
  const allCategories = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)));

  const initialFilters = readFiltersFromURL();

  const [filters, setFilters] = useState(() => ({
    q: initialFilters.q,
    category: initialFilters.category,
    minPrice: initialFilters.minPrice,
    maxPrice: initialFilters.maxPrice,
  }));

 
  useEffect(() => {
    writeFiltersToURL(filters);
  }, [filters]);

  return (
    <div className="container">
      
      <style>{styles}</style>

      <header className="header">
        <div className="h1">GetSetYo: Dynamic Filterable List (Demo)</div>
        <div className="sub">Readable code, beginner-friendly and responsive</div>
      </header>

      <div className="controls-row mb-2">
        <div className="filters" style={{flex:1}}>
          <Filters categories={allCategories} filters={filters} onChange={(next) => setFilters(next)} />
        </div>
      </div>

      <section style={{marginTop:12}}>
        <h2 style={{fontSize:18, marginBottom:8}}>Products</h2>
        <ProductList products={MOCK_PRODUCTS} filters={filters} />
      </section>

      <PostList />

      <PaginatedList />

      <footer className="footer">
        Notes: This example uses mock data for products and public test APIs for posts. The CSS is inline and responsive.
      </footer>
    </div>
  );
}
