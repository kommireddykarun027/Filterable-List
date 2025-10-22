// src/components/PostList.jsx
import React from "react";
import useFetch from "../hooks/useFetch";

export default function PostList() {
  const url = "https://httpbin.org/delay/2?query=abcd";
  const { data, error, loading, retry } = useFetch(url);

  return (
    <div className="card mt-2">
      <h3>PostList (demo using httpbin)</h3>
      {loading && <div className="small">Loading posts... (simulated delay)</div>}
      {error && (
        <div className="small text-red">
          Error loading posts: {error.message}
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
