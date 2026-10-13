import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function QuizPlay() {
  const { id } = useParams();
  const nav = useNavigate();
  const { updateUser, refreshProfile } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const sendingRef = useRef(false);
  const answersRef = useRef({});
  answersRef.current = answers;

  const timeLeftRef = useRef(0);
  timeLeftRef.current = timeLeft;

  const totalSecondsRef = useRef(0);
  totalSecondsRef.current = totalSeconds;

  // Load Quiz
  useEffect(() => {
    api.get(`/quizzes/${id}/start`)
      .then((q) => {
        setQuiz(q);
        const secs = q.seconds || (q.durationMinutes ? q.durationMinutes * 60 : 300);
        setTotalSeconds(secs);
        setTimeLeft(secs);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  // Submission handler
  const submitQuiz = useCallback(async (forcedByTimer = false) => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setIsSubmitting(true);
    try {
      const timeTaken = Math.max(1, totalSecondsRef.current - timeLeftRef.current);
      const res = await api.post(`/quizzes/${id}/submit`, {
        answers: answersRef.current,
        timeTakenSeconds: timeTaken
      });

      // Update user state locally
      if (res.totalXp) {
        updateUser({ xp: res.totalXp, level: res.level, rank: res.rank });
      }
      refreshProfile();

      nav("/result", { state: { ...res, autoSubmitted: forcedByTimer } });
    } catch (e) {
      setError(e.message);
      sendingRef.current = false;
      setIsSubmitting(false);
    }
  }, [id, nav, updateUser, refreshProfile]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || totalSeconds <= 0) return;
    if (timeLeft <= 0) {
      submitQuiz(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, totalSeconds, submitQuiz]);

  // Keyboard shortcut support (1-4 or A-D)
  useEffect(() => {
    const handleKey = (e) => {
      if (!quiz) return;
      const currentQuestion = quiz.questions[currentIndex];
      if (!currentQuestion) return;

      const key = e.key.toUpperCase();
      let optIdx = -1;
      if (key === "A" || key === "1") optIdx = 0;
      else if (key === "B" || key === "2") optIdx = 1;
      else if (key === "C" || key === "3") optIdx = 2;
      else if (key === "D" || key === "4") optIdx = 3;

      if (optIdx >= 0 && optIdx < 4) {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optIdx }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [quiz, currentIndex]);

  if (!quiz) {
    return (
      <div className="page-container">
        {error ? (
          <div className="msg-banner msg-error">{error}</div>
        ) : (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Initializing secure quiz session...</p>
          </div>
        )}
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const isCriticalTime = timeLeft <= 30;
  const isWarningTime = timeLeft <= 60 && !isCriticalTime;
  const timeProgressPercent = Math.max(0, (timeLeft / totalSeconds) * 100);

  return (
    <div className="page-container quiz-play-container">
      {/* Top Header Bar */}
      <div className="quiz-top-bar card">
        <div className="quiz-info-col">
          <div className="quiz-tags-inline">
            <span className="quiz-subject-badge">{quiz.subject || "General"}</span>
            {quiz.isPyq && <span className="tag-pyq">📜 {quiz.year || "PYQ"}</span>}
          </div>
          <h2 className="quiz-active-title">{quiz.title}</h2>
          <span className="progress-text">
            Question <b>{currentIndex + 1}</b> of <b>{questions.length}</b> &middot; {answeredCount} answered
          </span>
        </div>

        {/* Live Timer */}
        <div className={`quiz-timer-widget ${isCriticalTime ? "critical" : isWarningTime ? "warning" : ""}`}>
          <div className="timer-icon">⏱️</div>
          <div className="timer-details">
            <span className="timer-label">Time Remaining</span>
            <span className="timer-digits">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="quiz-progress-trackers">
        <div className="bar answered-bar" title="Questions Answered Progress">
          <i style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <div className="bar time-bar" title="Time Remaining Progress">
          <i
            style={{
              width: `${timeProgressPercent}%`,
              backgroundColor: isCriticalTime ? "var(--bad)" : isWarningTime ? "var(--acc2)" : "var(--acc)"
            }}
          />
        </div>
      </div>

      {error && <div className="msg-banner msg-error">{error}</div>}

      {/* Main Question & Palette Layout */}
      <div className="quiz-layout-grid">
        {/* Left Question Box */}
        <div className="card question-card">
          <div className="question-header">
            <span className="q-number-pill">Q{currentIndex + 1}</span>
            <button
              className={`flag-btn ${flags[currentQ.id] ? "flagged" : ""}`}
              onClick={() => setFlags({ ...flags, [currentQ.id]: !flags[currentQ.id] })}
            >
              {flags[currentQ.id] ? "🚩 Flagged for Review" : "🏳️ Flag for Review"}
            </button>
          </div>

          <h3 className="question-text">{currentQ.text}</h3>

          <div className="options-stack">
            {currentQ.options.map((optionText, optIdx) => {
              const isSelected = answers[currentQ.id] === optIdx;
              const optionLetter = String.fromCharCode(65 + optIdx);
              return (
                <button
                  key={optIdx}
                  className={`option-tile ${isSelected ? "selected" : ""}`}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: optIdx })}
                >
                  <div className="opt-letter-circle">{optionLetter}</div>
                  <span className="opt-text">{optionText}</span>
                  {isSelected && <span className="opt-checkmark">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="quiz-nav-row">
            <button
              className="btn btn-secondary sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((c) => c - 1)}
            >
              ← Previous
            </button>

            {answers[currentQ.id] !== undefined && (
              <button
                className="btn btn-secondary sm"
                onClick={() => {
                  const copy = { ...answers };
                  delete copy[currentQ.id];
                  setAnswers(copy);
                }}
              >
                Clear Choice
              </button>
            )}

            {isLastQuestion ? (
              <button
                className="btn btn-primary sm submit-quiz-btn"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(true)}
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz 🏁"}
              </button>
            ) : (
              <button
                className="btn btn-primary sm"
                onClick={() => setCurrentIndex((c) => c + 1)}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Right Palette */}
        <div className="card palette-card">
          <h4 className="palette-title">Question Navigator</h4>
          <div className="palette-stats-summary">
            <span className="p-pill answered">{answeredCount} Answered</span>
            <span className="p-pill unanswered">{unansweredCount} Left</span>
          </div>

          <div className="palette-grid">
            {questions.map((qItem, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[qItem.id] !== undefined;
              const isFlagged = flags[qItem.id];

              let statusClass = "";
              if (isCurrent) statusClass += " current";
              if (isFlagged) statusClass += " flagged";
              else if (isAnswered) statusClass += " answered";

              return (
                <button
                  key={qItem.id}
                  className={`palette-slot ${statusClass}`}
                  onClick={() => setCurrentIndex(idx)}
                  title={`Go to Question ${idx + 1}`}
                >
                  {idx + 1}
                  {isFlagged && <span className="mini-flag">🚩</span>}
                </button>
              );
            })}
          </div>

          <div className="palette-legend">
            <div className="legend-item"><span className="legend-dot answered"></span> Answered</div>
            <div className="legend-item"><span className="legend-dot flagged"></span> Flagged</div>
            <div className="legend-item"><span className="legend-dot current"></span> Current</div>
            <div className="legend-item"><span className="legend-dot unvisited"></span> Unanswered</div>
          </div>

          <button
            className="btn btn-primary submit-sidebar-btn"
            disabled={isSubmitting}
            onClick={() => setShowConfirmModal(true)}
          >
            Finish &amp; Submit
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3>Ready to submit your quiz?</h3>
            <p>
              You have answered <b>{answeredCount}</b> out of <b>{questions.length}</b> questions.
              {unansweredCount > 0 && (
                <span className="unanswered-warning"> (You still have {unansweredCount} unanswered questions).</span>
              )}
            </p>
            <p className="timer-notice">Time remaining: <b>{formattedTime}</b></p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Continue Quiz
              </button>
              <button
                className="btn btn-primary sm"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  submitQuiz(false);
                }}
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
