import { useApi } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Leaderboard() {
  const { data, error, loading } = useApi("/leaderboard");
  const { user } = useAuth();

  if (error) return <div className="msg-banner msg-error">{error}</div>;

  const top3 = data && data.length >= 3 ? [data[1], data[0], data[2]] : []; // 2nd, 1st, 3rd for podium

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">🏆 Global Rankings</span>
          <h1 className="hero-heading">Leaderboard &amp; Hall of Fame</h1>
          <p className="hero-sub">
            Ranked by overall experience points (XP), quiz accuracy, and academic mastery.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Compiling global standings...</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="card empty-state">
          <p>No leaderboard standings yet. Be the first to take a quiz!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length === 3 && (
            <div className="podium-container">
              {/* 2nd Place */}
              <div className="podium-card rank-2">
                <div className="podium-crown">🥈 2nd</div>
                <div className="podium-avatar">{top3[0].username.charAt(0).toUpperCase()}</div>
                <h3 className="podium-user">{top3[0].username}</h3>
                <span className="podium-tier">{top3[0].rank || "Diamond"}</span>
                <div className="podium-points">{top3[0].points} XP</div>
                <span className="podium-quizzes">{top3[0].quizzes} quizzes</span>
              </div>

              {/* 1st Place */}
              <div className="podium-card rank-1">
                <div className="podium-crown">👑 1st Champion</div>
                <div className="podium-avatar champ">{top3[1].username.charAt(0).toUpperCase()}</div>
                <h3 className="podium-user">{top3[1].username}</h3>
                <span className="podium-tier grandmaster">{top3[1].rank || "Grandmaster"}</span>
                <div className="podium-points">{top3[1].points} XP</div>
                <span className="podium-quizzes">{top3[1].quizzes} quizzes</span>
              </div>

              {/* 3rd Place */}
              <div className="podium-card rank-3">
                <div className="podium-crown">🥉 3rd</div>
                <div className="podium-avatar">{top3[2].username.charAt(0).toUpperCase()}</div>
                <h3 className="podium-user">{top3[2].username}</h3>
                <span className="podium-tier">{top3[2].rank || "Gold"}</span>
                <div className="podium-points">{top3[2].points} XP</div>
                <span className="podium-quizzes">{top3[2].quizzes} quizzes</span>
              </div>
            </div>
          )}

          {/* Full Standings Table */}
          <div className="card table-card">
            <h3 className="table-title">All Student Standings</h3>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Level</th>
                    <th>Tier Rank</th>
                    <th>Quizzes</th>
                    <th>Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, idx) => {
                    const isCurrentUser = r.username === user?.username;
                    return (
                      <tr key={r.username} className={isCurrentUser ? "highlight-user-row" : ""}>
                        <td className="rank-cell">
                          {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : `#${idx + 1}`}
                        </td>
                        <td className="user-cell">
                          <span className="table-avatar">{r.username.charAt(0).toUpperCase()}</span>
                          <span className="table-username">
                            {r.username}
                            {isCurrentUser && <span className="you-pill">You</span>}
                          </span>
                        </td>
                        <td>
                          <span className="lvl-pill">Lv. {r.level || 1}</span>
                        </td>
                        <td>
                          <span className={`rank-tag rank-${r.rank?.toLowerCase() || "bronze"}`}>
                            {r.rank || "Bronze"}
                          </span>
                        </td>
                        <td>{r.quizzes}</td>
                        <td className="points-cell">{r.points} XP</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
