"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  status: string;
  created_date: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects`);
      const data = await res.json();
      setProducts(data.projects || []);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>🚀 Atlas - Product Launch Factory</h1>
        <p>Orchestrate AI agents to launch products in 30 days</p>
      </div>

      <div className="actions">
        <Link href="/create">
          <button className="primary">+ New Product Idea</button>
        </Link>
        <button className="secondary" onClick={fetchProducts}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p>No products yet. Create your first idea! 💡</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <style jsx>{`
        .dashboard {
          padding: 20px 0;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .header p {
          color: var(--text-light);
          font-size: 1.1rem;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          justify-content: center;
        }

        .actions a {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
