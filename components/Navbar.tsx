"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link href="/">
            <div className="logo">
              <span className="logo-icon">🚀</span>
              <span className="logo-text">Atlas</span>
            </div>
          </Link>
          <ul className="nav-links">
            <li><Link href="/">Tableau de bord</Link></li>
            <li><Link href="/create">Nouvelle idée</Link></li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-alt) 100%);
          border-bottom: 2px solid var(--border-accent);
          padding: 16px 0;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0, 217, 255, 0.05);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          font-size: 1.8rem;
          animation: spin 20s linear infinite;
        }

        .logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 32px;
        }

        .nav-links li {
          position: relative;
        }

        .nav-links a {
          color: var(--text);
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          position: relative;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transition: width 0.3s ease;
        }

        .nav-links a:hover {
          color: var(--primary);
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </nav>
  );
}
