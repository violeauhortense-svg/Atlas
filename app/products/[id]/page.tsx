"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getPhaseLabel, formatDate } from "@/lib/utils";
import DecisionTree from "@/components/DecisionTree";

interface ProductData {
  id: string;
  name: string;
  status: string;
  created_at: string;
  description?: string;
  target_users?: string;
  problem?: string;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${productId}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Échec du chargement du produit", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement du produit...</div>;
  if (!product) return <div className="error">Produit non trouvé</div>;

  return (
    <div className="product-page">
      <div className="product-header">
        <h1>{product.name}</h1>
        <div className="phase-info">
          <span className="phase">{getPhaseLabel(product.status)}</span>
          <span className="date">Créé : {formatDate(product.created_at)}</span>
        </div>
      </div>


      <DecisionTree projectId={productId} />

      <style jsx>{`
        .product-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .product-header {
          margin-bottom: 30px;
        }

        .product-header h1 {
          margin-bottom: 10px;
          font-size: 2rem;
        }

        .phase-info {
          display: flex;
          gap: 20px;
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .phase {
          background-color: var(--bg-alt);
          padding: 5px 12px;
          border-radius: 20px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
