"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateIdea() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetUsers: "",
    problem: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create project");
      }

      const newProject = await res.json();
      router.push("/");
    } catch (err) {
      setError("Échec de la soumission de l'idée");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <h1>💡 Nouvelle idée produit</h1>
      <p className="subtitle">Soumettez une idée et laissez Atlas orchestrer le lancement</p>

      <div className="form-container">
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du produit *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Bot Slack Summary"
              required
            />
          </div>

          <div className="form-group">
            <label>Quelle est l'idée ? *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez ce qu'il fait en une phrase"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Utilisateurs cibles *</label>
            <input
              type="text"
              name="targetUsers"
              value={formData.targetUsers}
              onChange={handleChange}
              placeholder="Ex: Cadres occupés gérant Slack"
              required
            />
          </div>

          <div className="form-group">
            <label>Problème résolu *</label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              placeholder="Quel problème résout-il ?"
              rows={3}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Envoi..." : "Soumettre l'idée"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => router.push("/")}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-page {
          max-width: 600px;
          margin: 0 auto;
        }

        .subtitle {
          color: var(--text-light);
          margin-bottom: 30px;
        }

        .form-container {
          background-color: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 30px;
          box-shadow: var(--shadow);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .form-actions button {
          flex: 1;
        }

        select {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}
