// src/App.jsx
import React, { useEffect, useState } from "react";
import Filters from "./components/Filters";
import ProductList from "./components/ProductList";
import PostList from "./components/PostList";
import PaginatedList from "./components/PaginatedList";
import { MOCK_PRODUCTS } from "./data/products";
import "./index.css";

// Utilities for URL filters (same as before)
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

export default function App() {
  const allCategories = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)));
  const initialFilters = readFiltersFromURL();

  const [filters, setFilters] = useState(() => ({
    q: initialFilters.q,
    category: initialFilters.category,
    minPrice: initialFilters.minPrice,
    maxPrice: initialFilters.maxPrice,
  }));

  useEffect(() => { writeFiltersToURL(filters); }, [filters]);

  // scroll-based body class (optional)
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 10) document.body.classList.add("scrolled");
      else document.body.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div className="h1">GetSetYo: Dynamic Filterable List (Demo)</div>
        <div className="sub">Readable code, beginner-friendly and responsive</div>
      </header>

      <div className="layout">
        <aside>
          <Filters categories={allCategories} filters={filters} onChange={(next) => setFilters(next)} />
          <div className="mt-2"><PostList /></div>
        </aside>

        <main>
          <div className="content">
            <section>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Products</h2>
              <ProductList products={MOCK_PRODUCTS} filters={filters} />
            </section>

            <div className="mt-2"><PaginatedList /></div>
          </div>
        </main>
      </div>

      <footer className="footer">Notes: mock data for products and public test APIs for posts. Resize browser to test responsiveness.</footer>
    </div>
  );
}
