"use client";

import Link from "next/link";
import { useState } from "react";
import { getStatusBadge, getPhaseProgress, getAgentsForPhase } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    status: string;
    created_at: string;
  };
  onDelete?: (productId: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const [deleting, setDeleting] = useState(false);
  const progress = getPhaseProgress(product.status);
  const statusBadge = getStatusBadge(product.status);
  const agents = getAgentsForPhase(product.status);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${product.id}`, {
        method: "DELETE",
      });

      if (res.ok && onDelete) {
        onDelete(product.id);
      }
    } catch (err) {
      console.error("Erreur de suppression", err);
      alert("Impossible de supprimer le produit");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
          <h3 style={{ margin: 0 }}>{product.name}</h3>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="delete-btn"
            title="Supprimer ce projet"
          >
            {deleting ? "..." : "✕"}
          </button>
        </div>

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
          Progression : {progress}%
        </small>

        {agents.length > 0 && (
          <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid var(--border)" }}>
            <p style={{ marginBottom: "8px", fontSize: "0.85rem", fontWeight: "600", color: "var(--text)" }}>
              🤖 Agents actifs :
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {agents.map((agent, idx) => (
                <div key={idx} style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                  <span style={{ color: "var(--primary)", fontWeight: "500" }}>{agent.name}</span>
                  <br />
                  {agent.task}
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "var(--text-light)" }}>
          Créé : {new Date(product.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <style jsx>{`
        .product-card {
          position: relative;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 12px;
          background: var(--bg-elevated);
          border: 2px solid var(--border);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.1), transparent);
          transition: left 0.5s ease;
          pointer-events: none;
        }

        .product-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 20px 50px rgba(0, 217, 255, 0.15);
        }

        .product-card:hover::before {
          left: 100%;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: var(--bg-alt);
          border-radius: 6px;
          overflow: hidden;
          margin-top: 12px;
          border: 1px solid var(--border);
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-size: 1.4rem;
          padding: 4px 12px;
          transition: all 0.3s ease;
          font-weight: 700;
        }

        .delete-btn:hover:not(:disabled) {
          color: var(--danger);
          transform: scale(1.3) rotate(90deg);
          text-shadow: 0 0 10px rgba(255, 56, 96, 0.5);
        }

        .delete-btn:active:not(:disabled) {
          transform: scale(0.95) rotate(90deg);
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </Link>
  );
}
