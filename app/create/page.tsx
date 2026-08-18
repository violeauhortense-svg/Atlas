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
      // For now, just show success and redirect
      // In production, this would call your backend API
      alert(`✅ Idea submitted!\n\n${formData.name}\n\nPhase 1 validation starting...`);
      router.push("/");
    } catch (err) {
      setError("Failed to submit idea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <h1>💡 New Product Idea</h1>
      <p className="subtitle">Submit an idea and let Atlas orchestrate the launch</p>

      <div className="form-container">
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Slack Summary Bot"
              required
            />
          </div>

          <div className="form-group">
            <label>What's the idea? *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what it does in one sentence"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Users *</label>
            <input
              type="text"
              name="targetUsers"
              value={formData.targetUsers}
              onChange={handleChange}
              placeholder="e.g., Busy executives managing Slack"
              required
            />
          </div>

          <div className="form-group">
            <label>Problem it solves *</label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              placeholder="What pain point does this address?"
              rows={3}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Idea"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => router.push("/")}
              disabled={loading}
            >
              Cancel
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
