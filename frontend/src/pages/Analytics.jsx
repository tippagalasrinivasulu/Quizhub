import { useApi } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Analytics() {
  const stats = useApi("/results/stats");
  const hist = useApi("/results/me");
  const profile = useApi("/users/profile");
  const { user } = useAuth();

  if (stats.error || hist.error) {
    return <div className="msg-banner msg-error">{stats.error || hist.error}</div>;
  }

  const pData = profile.data;
  const badgesEarned = pData?.badges || [];

  const allPossibleBadges = [
    { title: "🎯 First Flight", desc: "Complete your first quiz", icon: "🎯" },
    { title: "⚡ Speed Demon", desc: "Complete quiz in less than 50% time limit", icon: "⚡" },
    { title: "🏆 Century Club", desc: "Score 100% perfect in any quiz", icon: "🏆" },
    { title: "🌟 High Achiever", desc: "Maintain over 80% accuracy score", icon: "🌟" },
    { title: "🔥 Quiz Veteran", desc: "Successfully finish 5 or more quizzes", icon: "🔥" },
    { title: "👑 Trivia Titan", desc: "Successfully finish 10 or more quizzes", icon: "👑" },
    { title: "💎 Diamond Mind", desc: "Accumulate 1,000+ experience points", icon: "💎" },
    { title: "🎖️ Grandmaster Scholar", desc: "Reach 1,500+ XP in QuizHub", icon: "🎖️" }
  ];

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">📈 Personal Insights</span>
          <h1 className="hero-heading">Academic Analytics &amp; Badges</h1>
          <p className="hero-sub">
            Track your performance metrics across academic subjects, evaluate mastery, and collect achievement badges.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card profile-overview-card">
        <div className="overview-left">
          <div className="large-avatar-glow">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{user?.username}</h2>
            <p className="muted">✉️ {pData?.email || user?.email}</p>
            <div className="tier-pills">
              <span className={`rank-tag rank-${pData?.rank?.toLowerCase() || "bronze"}`}>
                🛡️ {pData?.rank || "Bronze"}
              </span>
              <span className="lvl-pill">Level {pData?.level || 1} Scholar</span>
              <span className="xp-pill">⚡ {pData?.xp || 0} Total XP</span>
            </div>
          </div>
        </div>
        <div className="overview-right">
          <div className="stat-box">
            <span className="stat-num">{pData?.quizzesCount || 0}</span>
            <span className="stat-label">Quizzes Completed</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{pData?.avgPercent || 0}%</span>
            <span className="stat-label">Average Accuracy</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{badgesEarned.length}</span>
            <span className="stat-label">Badges Collected</span>
          </div>
        </div>
      </div>

      {/* Badges Trophy Shelf */}
      <div className="card trophy-shelf-card">
        <h3>🏆 Achievements &amp; Badges Showcase</h3>
        <p className="muted">Unlock exclusive badges by testing knowledge, scoring perfect marks, and speed running.</p>
        <div className="trophy-grid">
          {allPossibleBadges.map((b, idx) => {
            const isUnlocked = badgesEarned.some((be) => be.includes(b.title.replace(/[^a-zA-Z ]/g, "").trim()));
            return (
              <div key={idx} className={`trophy-badge-card ${isUnlocked ? "unlocked" : "locked"}`}>
                <div className="trophy-icon">{b.icon}</div>
                <div className="trophy-info">
                  <h4 className="trophy-title">{b.title}</h4>
                  <p className="trophy-desc">{b.desc}</p>
                  <span className={`trophy-status ${isUnlocked ? "status-unlocked" : "status-locked"}`}>
                    {isUnlocked ? "✓ Unlocked" : "🔒 In Progress"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Mastery Analytics */}
      <div className="card analytics-card">
        <h3>Subject Mastery &amp; Accuracy</h3>
        <p className="muted">Average score per subject. Prioritize practicing the lower percentage areas.</p>
        {stats.data && stats.data.length > 0 ? (
          <div className="subject-bars-list">
            {stats.data.map((s) => (
              <div className="subject-bar-item" key={s.subject}>
                <div className="subject-bar-info">
                  <span className="subject-name">{s.subject}</span>
                  <span className="subject-attempts">{s.attempts} attempts &middot; {s.average}% avg</span>
                </div>
                <div className="bar mastery-bar">
                  <i
                    style={{
                      width: `${s.average}%`,
                      backgroundColor:
                        s.average >= 75 ? "var(--ok)" : s.average >= 50 ? "var(--acc)" : "var(--bad)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No attempts yet. Complete a quiz to see your subject breakdown.</p>
        )}
      </div>

      {/* Full Results History */}
      <div className="card history-card">
        <h3>Recent Quiz History</h3>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Quiz Title</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Time Spent</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {hist.data && hist.data.length > 0 ? (
                hist.data.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.takenAt).toLocaleString()}</td>
                    <td><b>{r.quiz}</b></td>
                    <td><span className="quiz-subject-badge">{r.subject || "General"}</span></td>
                    <td>{r.score}/{r.total}</td>
                    <td>
                      <span className={`percent-badge ${r.percent >= 75 ? "good" : r.percent >= 50 ? "mid" : "bad"}`}>
                        {r.percent}%
                      </span>
                    </td>
                    <td>{r.timeTakenSeconds ? `${Math.floor(r.timeTakenSeconds / 60)}m ${r.timeTakenSeconds % 60}s` : "—"}</td>
                    <td><span className="reward-badge primary-badge sm">{r.badge || "Completed"}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center muted">
                    No results recorded yet. Go take your first quiz!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
