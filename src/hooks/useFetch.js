// src/hooks/useFetch.js
import { useCallback, useEffect, useRef, useState } from "react";

const globalCache = new Map();

export default function useFetch(url) {
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

    if (controllerRef.current) controllerRef.current.abort();
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
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [url, fetchData]);

  const retry = useCallback(() => {
    globalCache.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, error, loading, retry };
}
