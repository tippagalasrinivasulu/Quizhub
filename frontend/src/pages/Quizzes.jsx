import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../api.js";

export default function Quizzes() {
  const { data, error, loading } = useApi("/quizzes");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const subjects = useMemo(() => {
    if (!data) return ["All"];
    const set = new Set(data.map((q) => q.subject || "General"));
    return ["All", ...Array.from(set)];
  }, [data]);

  const filteredQuizzes = useMemo(() => {
    if (!data) return [];
    return data.filter((q) => {
      const matchSubject = selectedSubject === "All" || (q.subject || "General") === selectedSubject;
      const matchDiff = filterDifficulty === "All" || q.difficulty === filterDifficulty;
      const matchSearch =
        search.trim() === "" ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(search.toLowerCase())) ||
        (q.subject && q.subject.toLowerCase().includes(search.toLowerCase()));
      return matchSubject && matchDiff && matchSearch;
    });
  }, [data, selectedSubject, filterDifficulty, search]);

  if (error) return <div className="msg-banner msg-error">{error}</div>;

  return (
    <div className="page-container">
      {/* Banner for AI PYQ Generator */}
      <div className="ai-banner-card">
        <div className="ai-banner-content">
          <span className="badge-pill gradient-pill">🚀 AI Agent Powered</span>
          <h2>Have Previous Year Question Papers (PYQ) or Notes?</h2>
          <p>
            Upload any exam paper PDF or syllabus document. Our intelligent AI Agent extracts MCQs,
            configures timing, and builds an exam-ready quiz in seconds.
          </p>
        </div>
        <Link to="/ai-studio" className="btn btn-primary ai-banner-btn">
          ✨ Upload PYQ / PDF &amp; Take Quiz
        </Link>
      </div>

      <div className="section-header">
        <div>
          <h1 className="hero-heading">Available Quizzes &amp; PYQ Papers</h1>
          <p className="hero-sub">
            Filter by academic subject or difficulty. Time limits and scoring criteria are strictly calibrated.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search quizzes by title, topic or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="difficulty-select-wrap">
          <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard (Exam Grade)</option>
          </select>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="subject-pills-row">
        {subjects.map((sub) => (
          <button
            key={sub}
            className={`subject-pill ${selectedSubject === sub ? "active" : ""}`}
            onClick={() => setSelectedSubject(sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading enterprise quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-text">No quizzes match your filters.</p>
          <button className="btn btn-secondary sm" onClick={() => { setSelectedSubject("All"); setFilterDifficulty("All"); setSearch(""); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="quiz-cards-grid">
          {filteredQuizzes.map((q) => {
            const minutes = q.durationMinutes || Math.max(2, Math.round(q.seconds / 60));
            return (
              <div className="quiz-card" key={q.id}>
                <div className="quiz-card-header">
                  <span className="quiz-subject-badge">{q.subject || "General"}</span>
                  <div className="quiz-meta-badges">
                    {q.isPyq && <span className="tag-pyq">📜 {q.year || "PYQ"}</span>}
                    <span className={`tag-diff diff-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                  </div>
                </div>

                <h3 className="quiz-card-title">{q.title}</h3>
                <p className="quiz-card-desc">{q.description || "Comprehensive conceptual assessment."}</p>

                <div className="quiz-card-stats">
                  <div className="stat-pill">
                    <span className="stat-icon">❓</span>
                    <span>{q.questionCount} Questions</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-icon">⏱️</span>
                    <span>{minutes} Min Limit</span>
                  </div>
                </div>

                <div className="quiz-card-footer">
                  {q.questionCount > 0 ? (
                    <Link to={`/quiz/${q.id}`} className="btn btn-primary start-btn">
                      🚀 Start Assessment
                    </Link>
                  ) : (
                    <span className="empty-tag">No questions added yet</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
