import { Link } from "react-router-dom";
import { useApi } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, loading } = useApi("/results/me");
  const profile = useApi("/users/profile");

  if (error) return <div className="msg-banner msg-error">{error}</div>;

  const results = data || [];
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percent, 0) / results.length) : 0;
  const best = results.length ? Math.max(...results.map((r) => r.percent)) : 0;
  const xp = profile.data?.xp || user?.xp || 0;
  const level = profile.data?.level || user?.level || 1;
  const rank = profile.data?.rank || user?.rank || "Bronze";

  return (
    <div className="page-container dashboard-page">
      {/* Welcome Banner */}
      <div className="dash-hero-card">
        <div className="dash-hero-info">
          <div className="user-welcome-row">
            <h1 className="hero-heading">Welcome back, {user?.username}!</h1>
            <span className={`rank-tag rank-${rank.toLowerCase()}`}>🛡️ {rank} Tier</span>
            <span className="lvl-pill">Level {level}</span>
          </div>
          <p className="hero-sub">
            Your personalized learning dashboard. Test yourself with timed quizzes or import PYQ exam papers via AI.
          </p>
        </div>
        <div className="dash-hero-actions">
          <Link to="/quizzes" className="btn btn-primary sm">
            🚀 Browse Quizzes
          </Link>
          <Link to="/ai-studio" className="btn btn-secondary sm">
            🤖 AI PYQ Studio
          </Link>
        </div>
      </div>

      {/* High Scale Metrics Grid */}
      <div className="stats-metric-grid">
        <div className="metric-card card">
          <span className="metric-icon">📝</span>
          <div className="metric-val">{results.length}</div>
          <span className="metric-label">Quizzes Completed</span>
        </div>
        <div className="metric-card card">
          <span className="metric-icon">🎯</span>
          <div className="metric-val">{avg}%</div>
          <span className="metric-label">Average Accuracy</span>
        </div>
        <div className="metric-card card">
          <span className="metric-icon">⭐</span>
          <div className="metric-val">{best}%</div>
          <span className="metric-label">Personal Best</span>
        </div>
        <div className="metric-card card">
          <span className="metric-icon">⚡</span>
          <div className="metric-val">{xp}</div>
          <span className="metric-label">Experience Points</span>
        </div>
      </div>

      {/* Recent Attempts Table Card */}
      <div className="card table-card" style={{ marginTop: "24px" }}>
        <div className="card-header-flex">
          <div>
            <h3>Recent Quiz Attempts</h3>
            <p className="muted">Your most recent mock tests and previous year papers.</p>
          </div>
          <Link to="/quizzes" className="btn btn-secondary sm">
            Start New Quiz
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading activity...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Badge Awarded</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.takenAt).toLocaleDateString()}</td>
                    <td><b>{r.quiz}</b></td>
                    <td><span className="quiz-subject-badge">{r.subject || "General"}</span></td>
                    <td>{r.score}/{r.total}</td>
                    <td>
                      <span className={`percent-badge ${r.percent >= 75 ? "good" : r.percent >= 50 ? "mid" : "bad"}`}>
                        {r.percent}%
                      </span>
                    </td>
                    <td><span className="reward-badge primary-badge sm">{r.badge || "Passed"}</span></td>
                  </tr>
                ))}
                {!results.length && (
                  <tr>
                    <td colSpan="6" className="text-center muted">
                      No attempts yet. Explore the quizzes or try our AI PYQ Studio!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
