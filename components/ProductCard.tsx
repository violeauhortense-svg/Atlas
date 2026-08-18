"use client";

import Link from "next/link";
import { getStatusBadge, getPhaseProgress } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    status: string;
    created_date: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const progress = getPhaseProgress(product.status);
  const statusBadge = getStatusBadge(product.status);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card" style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = "translateY(-4px)";
             e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = "translateY(0)";
             e.currentTarget.style.boxShadow = "var(--shadow)";
           }}>
        <h3>{product.name}</h3>
        
        <div style={{ marginTop: "10px", marginBottom: "15px" }}>
          <span className={`badge ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <small style={{ color: "var(--text-light)" }}>
          Progress: {progress}%
        </small>

        <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "var(--text-light)" }}>
          Created: {new Date(product.created_date).toLocaleDateString()}
        </p>
      </div>

      <style jsx>{`
        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: var(--bg);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0070f3, #0051cc);
          transition: width 0.3s ease;
        }
      `}</style>
    </Link>
  );
}
