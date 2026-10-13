import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const toggleTheme = () => {
    const r = document.documentElement;
    const isDark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    r.dataset.theme = isDark ? "light" : "dark";
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const links = user?.role === "ADMIN"
    ? [
        ["/admin", "Admin Hub"],
        ["/admin/performance", "Student Performance"],
        ["/ai-studio", "AI Quiz Studio"]
      ]
    : [
        ["/", "Dashboard"],
        ["/quizzes", "Quizzes & PYQs"],
        ["/ai-studio", "AI Quiz Studio"],
        ["/leaderboard", "Leaderboard"],
        ["/analytics", "My Analytics"]
      ];

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "U";
  const isAdmin = user?.role === "ADMIN";
  const level = user?.level || 1;
  const rank = user?.rank || "Bronze";
  const xp = user?.xp || 0;
  const nextLvlXp = level >= 6 ? 2000 : level === 5 ? 1500 : level === 4 ? 1000 : level === 3 ? 600 : level === 2 ? 300 : 100;
  const prevLvlXp = level === 1 ? 0 : level === 2 ? 100 : level === 3 ? 300 : level === 4 ? 600 : level === 5 ? 1000 : 1500;
  const progressPercent = Math.min(100, Math.max(10, Math.round(((xp - prevLvlXp) / Math.max(1, nextLvlXp - prevLvlXp)) * 100)));

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="top">
          <Link to="/" className="brand">
            <span className="brand-logo-icon">⚡</span>
            <span>Quiz<b className="gradient-text">Hub</b></span>
            <span className="ai-pill">AI 2.0</span>
          </Link>

          <div className="tools">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              🌓 <span className="theme-label">Theme</span>
            </button>

            {/* Profile Logo & Interactive Dropdown */}
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className={`profile-trigger ${profileOpen ? "active" : ""}`}
                onClick={() => setProfileOpen(!profileOpen)}
                title="View Profile Details"
                aria-label="User Profile"
              >
                <div className="avatar-circle">
                  <span>{initial}</span>
                  <div className="status-dot"></div>
                </div>
                <div className="profile-brief">
                  <span className="brief-name">{user?.username}</span>
                  <span className="brief-rank">{isAdmin ? "Administrator" : `Lvl ${level} · ${rank}`}</span>
                </div>
                <span className="chevron">▾</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown-card">
                  <div className="dropdown-header">
                    <div className="large-avatar">
                      {initial}
                      {!isAdmin && <span className="avatar-badge">Lv.{level}</span>}
                    </div>
                    <div className="user-info">
                      <h4 className="user-name">{user?.username}</h4>
                      <p className="user-email" title={user?.email}>
                        ✉️ {user?.email || `${user?.username}@quizhub.com`}
                      </p>
                      <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                        {user?.role === "ADMIN" ? "🛡️ System Admin" : "🎓 Registered Student"}
                      </span>
                    </div>
                  </div>

                  {!isAdmin && (
                    <>
                      <div className="profile-stats-grid">
                        <div className="p-stat">
                          <span className="p-stat-val">{xp}</span>
                          <span className="p-stat-lbl">Total XP</span>
                        </div>
                        <div className="p-stat">
                          <span className="p-stat-val">{rank}</span>
                          <span className="p-stat-lbl">Tier Rank</span>
                        </div>
                        <div className="p-stat">
                          <span className="p-stat-val">Lv. {level}</span>
                          <span className="p-stat-lbl">Scholar</span>
                        </div>
                      </div>

                      <div className="xp-bar-container">
                        <div className="xp-meta">
                          <span>XP Progress</span>
                          <span>{xp} / {nextLvlXp} XP</span>
                        </div>
                        <div className="bar xp-bar">
                          <i style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="dropdown-actions">
                    {!isAdmin && (
                      <Link
                        to="/analytics"
                        className="dropdown-btn secondary"
                        onClick={() => setProfileOpen(false)}
                      >
                        📊 My Badges & Stats
                      </Link>
                    )}
                    <button
                      className="dropdown-btn danger"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        nav("/login");
                      }}
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="main-nav">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/" || to === "/admin"}
              className={({ isActive }) => (isActive ? "nav-link on" : "nav-link")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <p>QuizHub Enterprise &middot; Scalable Spring Boot &amp; React Architecture &middot; MySQL Powered</p>
      </footer>
    </div>
  );
}
