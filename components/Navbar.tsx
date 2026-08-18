import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link href="/">
            <div className="logo">
              🚀 Atlas
            </div>
          </Link>
          <ul className="nav-links">
            <li><Link href="/">Dashboard</Link></li>
            <li><Link href="/create">New Idea</Link></li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background-color: var(--bg-alt);
          border-bottom: 1px solid var(--border);
          padding: 15px 0;
          margin-bottom: 30px;
          box-shadow: var(--shadow);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          cursor: pointer;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 30px;
        }

        .nav-links a {
          color: var(--text);
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--primary);
        }
      `}</style>
    </nav>
  );
}
