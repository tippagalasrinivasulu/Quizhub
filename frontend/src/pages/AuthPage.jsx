import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { save } = useAuth();
  const nav = useNavigate();
  const isLogin = tab === "login";

  const setField = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const fillDemo = (username, pass) => {
    setF({ username, email: `${username}@quizhub.com`, password: pass });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = isLogin
        ? { username: f.username.trim(), password: f.password }
        : { username: f.username.trim(), email: f.email.trim(), password: f.password };

      const res = await api.post(isLogin ? "/auth/login" : "/auth/register", body);
      save(res);
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-main-wrap">
      <div className="auth-card-modern">
        {/* Left Hero Graphic Section */}
        <div className="auth-side-brand">
          <div className="brand-header">
            <span className="brand-logo-icon">⚡</span>
            <span className="brand-title">Quiz<b className="gradient-text">Hub</b></span>
            <span className="ai-pill">AI 2.0</span>
          </div>

          <h1 className="auth-tagline">High-Scale Learning &amp; AI Assessment Platform</h1>
          <p className="auth-desc">
            Master engineering, computer science, and competitive exams with real-time timed quizzes,
            AI-parsed PYQ papers, interactive leaderboards, and gamified level progression.
          </p>

          <div className="features-list">
            <div className="feat-item">
              <span className="feat-icon">🤖</span>
              <span><b>AI PYQ Extractor:</b> Upload exam paper PDFs to auto-generate quizzes</span>
            </div>
            <div className="feat-item">
              <span className="feat-icon">⏱️</span>
              <span><b>Precision Timer:</b> Strict exam timing with auto-submit &amp; speed bonuses</span>
            </div>
            <div className="feat-item">
              <span className="feat-icon">🛡️</span>
              <span><b>Gamification &amp; Ranks:</b> Unlock badges, gain XP, and climb the Leaderboard</span>
            </div>
            <div className="feat-item">
              <span className="feat-icon">📊</span>
              <span><b>Subject Mastery:</b> Deep analytics across Computer Science, Electronics, and Math</span>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="auth-form-side">
          <div className="auth-tabs-toggle">
            <button
              type="button"
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => { setTab("reg"); setError(""); }}
            >
              Register Student
            </button>
          </div>

          <form className="auth-form-inner" onSubmit={submit}>
            <h2 className="form-heading">{isLogin ? "Welcome Back!" : "Create Student Account"}</h2>
            <p className="form-sub muted">
              {isLogin
                ? "Enter your credentials to access your quizzes and rankings."
                : "Register now to start earning XP, badges, and take AI quizzes."}
            </p>

            <div className="input-group">
              <label htmlFor="authUsername">Username</label>
              <input
                id="authUsername"
                placeholder="e.g. alex_coder"
                value={f.username}
                onChange={setField("username")}
                autoComplete="username"
                required
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="authEmail">Registered Email</label>
                <input
                  id="authEmail"
                  type="email"
                  placeholder="e.g. alex@university.edu"
                  value={f.email}
                  onChange={setField("email")}
                  autoComplete="email"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="authPassword">Password</label>
              <input
                id="authPassword"
                type="password"
                placeholder="••••••••"
                value={f.password}
                onChange={setField("password")}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
            </div>

            {error && <div className="msg-banner msg-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={busy}>
              {busy ? "Please wait..." : isLogin ? "Sign In to QuizHub" : "Create My Student Account"}
            </button>

            {/* Quick Demo Logins */}
            {isLogin && import.meta.env.DEV && (
              <div className="demo-credentials-box">
                <span className="demo-title">Quick Demo Logins:</span>
                <div className="demo-btns">
                  <button
                    type="button"
                    className="demo-pill"
                    onClick={() => fillDemo("demo", "demo123")}
                  >
                    🎓 Demo Student (demo / demo123)
                  </button>
                  <button
                    type="button"
                    className="demo-pill"
                    onClick={() => fillDemo("priya", "pass123")}
                  >
                    🥇 Top Ranker (priya / pass123)
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
