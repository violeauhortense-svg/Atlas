"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ResourcesPanel from "@/components/ResourcesPanel";

interface Product {
  id: string;
  name: string;
  status: string;
  created_at: string;
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
      setError("Échec du chargement des produits");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>🚀 Atlas - Usine de Lancement Produit</h1>
        <p>Orchestrez les agents IA pour lancer des produits en 30 jours</p>
      </div>

      <div className="actions">
        <Link href="/create">
          <button className="primary">+ Nouvelle idée</button>
        </Link>
        <button className="secondary" onClick={fetchProducts}>
          🔄 Rafraîchir
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <ResourcesPanel />

      {loading ? (
        <div className="loading">Chargement des produits...</div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p>Aucun produit pour le moment. Créez votre première idée ! 💡</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} />
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
