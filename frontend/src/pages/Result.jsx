import { Link, Navigate, useLocation } from "react-router-dom";

export default function Result() {
  const location = useLocation();
  const r = location.state;
  if (!r) return <Navigate to="/" replace />;

  const C = 2 * Math.PI * 52;
  const percent = r.percent || 0;
  const strokeOffset = C - (C * percent) / 100;

  return (
    <div className="page-container result-page">
      {r.autoSubmitted && (
        <div className="msg-banner msg-warning">
          ⏰ <b>Time's up!</b> Your quiz was automatically submitted when the countdown reached zero.
        </div>
      )}

      {/* Main Score Hero Card */}
      <div className="card result-hero-card">
        <span className="quiz-subject-badge">{r.subject || "Assessment"}</span>
        <h2 className="result-quiz-title">{r.quiz} Result</h2>

        {/* Circular Progress Meter */}
        <div className="score-meter-wrap">
          <svg className="ring" width="160" height="160" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={percent >= 75 ? "var(--ok)" : percent >= 50 ? "var(--acc)" : "var(--bad)"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="66" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
              {percent}%
            </text>
          </svg>
        </div>

        <p className="score-summary-text">
          You scored <b>{r.score}</b> out of <b>{r.total}</b> questions correct.
        </p>

        {/* Badge & XP Rewards */}
        <div className="rewards-row">
          <span className="reward-badge primary-badge">{r.badge}</span>
          <span className="reward-badge xp-badge">⚡ +{r.xpEarned || 0} XP Earned</span>
          {r.rank && <span className="reward-badge rank-badge">🛡️ {r.rank} Tier</span>}
        </div>

        {/* Unlocked Badges */}
        {r.unlockedBadges && r.unlockedBadges.length > 0 && (
          <div className="unlocked-badges-box">
            <h4>🎉 Unlocked Badges &amp; Achievements</h4>
            <div className="unlocked-pills-list">
              {r.unlockedBadges.map((badgeName, idx) => (
                <span key={idx} className="badge-pill unlocked-pill">
                  {badgeName}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="result-actions-row">
          <Link to="/leaderboard" className="btn btn-secondary sm">
            🏆 View Leaderboard
          </Link>
          <Link to="/quizzes" className="btn btn-primary sm">
            🚀 Take Another Quiz
          </Link>
        </div>
      </div>

      {/* Answer Breakdown */}
      <div className="card review-breakdown-card">
        <h3>Question Analysis &amp; Answer Review</h3>
        <p className="muted">Review which answers you got right and wrong with correct solutions.</p>

        <div className="review-items-list">
          {r.review &&
            r.review.map((item, idx) => {
              const isCorrect = item.picked === item.correct;
              const answered = item.picked !== null && item.picked !== undefined;
              return (
                <div key={idx} className={`review-item ${isCorrect ? "is-correct" : "is-wrong"}`}>
                  <div className="review-item-header">
                    <span className="review-num">Question {idx + 1}</span>
                    <span className={`review-status-tag ${isCorrect ? "correct" : "wrong"}`}>
                      {isCorrect ? "✓ Correct" : answered ? "✗ Incorrect" : "○ Skipped"}
                    </span>
                  </div>

                  <p className="review-question-text">{item.question}</p>

                  <div className="review-options-grid">
                    {item.options.map((opt, oIdx) => {
                      const wasPicked = item.picked === oIdx;
                      const wasCorrect = item.correct === oIdx;
                      let optClass = "review-opt";
                      if (wasCorrect) optClass += " correct-opt";
                      if (wasPicked && !wasCorrect) optClass += " wrong-opt";

                      return (
                        <div key={oIdx} className={optClass}>
                          <span className="opt-letter">{String.fromCharCode(65 + oIdx)}.</span>
                          <span className="opt-val">{opt}</span>
                          {wasCorrect && <span className="badge-answer-tag">Correct Answer</span>}
                          {wasPicked && !wasCorrect && <span className="badge-user-tag">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="result-footer-nav">
          <Link to="/quizzes" className="btn btn-primary sm">
            Back to All Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
