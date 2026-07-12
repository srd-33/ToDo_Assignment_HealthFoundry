import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark">Taskflow</span>
          <span className="brand-sub">AI Task Manager</span>
        </Link>
        <nav className="nav-actions">
          <Link to="/" className="nav-link">
            All tasks
          </Link>
          <Link to="/tasks/new" className="btn btn-primary">
            New task
          </Link>
        </nav>
      </header>
      <main className="page">{children}</main>
      <footer className="site-footer">
        <p>Plan work. Explain it with AI. Ship it.</p>
      </footer>
    </div>
  );
}
