import { NavLink } from "react-router-dom";
import "/src/index.css";

export default function Navigation() {
  return (
    <header className="app-header">
      <div className="nav-container">
        <div className="brand">
          <span className="brand-mark" aria-hidden>✅</span>
          <span className="brand-text">Personal Timeline</span>
        </div>

        <nav className="nav-tabs" aria-label="Main">
          <NavLink to="/" end className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/timeline" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            🗓️ Timeline
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            ⚙️ Settings
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            👤 Profile
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
