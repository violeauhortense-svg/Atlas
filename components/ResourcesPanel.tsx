"use client";

import { useState, useEffect } from "react";

interface Skill {
  name: string;
  path: string;
  description: string;
}

export default function ResourcesPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [memoryConfigured, setMemoryConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [skillsRes, memoryRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/memory"),
        ]);

        const skillsData = await skillsRes.json();
        const memoryData = await memoryRes.json();

        setSkills(skillsData.skills || []);
        setMemoryConfigured(memoryData.memory?.configured || false);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) return <div>Chargement des ressources...</div>;

  return (
    <div className="resources-panel">
      <div className="resources-section">
        <h3>🧠 Mémoire Claude</h3>
        <div className="resource-status">
          {memoryConfigured ? (
            <span className="status-active">✅ Actif</span>
          ) : (
            <span className="status-inactive">❌ Inactif</span>
          )}
        </div>
      </div>

      <div className="resources-section">
        <h3>⚙️ Skills disponibles ({skills.length})</h3>
        <div className="skills-list">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-item">
              <span className="skill-name">{skill.description}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .resources-panel {
          padding: 20px;
          background-color: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-top: 20px;
        }

        .resources-section {
          margin-bottom: 20px;
        }

        .resources-section h3 {
          margin: 0 0 10px 0;
          font-size: 1rem;
          color: var(--text);
        }

        .resource-status {
          display: flex;
          gap: 10px;
        }

        .status-active {
          color: #22c55e;
          font-weight: 600;
        }

        .status-inactive {
          color: #ef4444;
          font-weight: 600;
        }

        .skills-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }

        .skill-item {
          padding: 10px;
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .skill-name {
          display: block;
          font-weight: 500;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
