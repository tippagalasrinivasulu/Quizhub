import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Admin() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("0");

  const loadQuizzes = () =>
    api.get("/quizzes").then((data) => {
      setQuizzes(data);
      setSelectedQuizId((current) =>
        current && data.some((quiz) => String(quiz.id) === current)
          ? current
          : data.length
            ? String(data[0].id)
            : ""
      );
    });

  useEffect(() => {
    loadQuizzes().catch((error) => setMsg({ ok: false, t: error.message }));
  }, []);

  const runAction = async (fn, successMsg) => {
    setLoading(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, t: successMsg });
    } catch (error) {
      setMsg({ ok: false, t: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = (id) =>
    runAction(async () => {
      if (!window.confirm("Are you sure you want to delete this entire quiz?")) return;
      await api.del(`/admin/quizzes/${id}`);
      await loadQuizzes();
    }, "Quiz deleted successfully.");

  const handleAddQuestion = (event) => {
    event.preventDefault();
    runAction(async () => {
      await api.post("/admin/questions", {
        quizId: Number(selectedQuizId),
        text: questionText.trim(),
        options: options.map((option) => option.trim()),
        correctOption: Number(correctOption)
      });
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectOption("0");
      await loadQuizzes();
    }, "Question added to the quiz.");
  };

  const updateOption = (index, value) => {
    setOptions((current) => current.map((option, i) => i === index ? value : option));
  };

  return (
    <div className="page-container admin-page">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">🛡️ System Administration</span>
          <h1 className="hero-heading">Admin Management Console</h1>
          <p className="hero-sub">
            Create quizzes from exam papers or study documents with the AI agent, and manage existing quizzes.
          </p>
        </div>
      </div>

      {msg && <div className={`msg-banner ${msg.ok ? "msg-success" : "msg-error"}`}>{msg.t}</div>}

      <div className="card admin-card">
        <h3>🤖 Create a Quiz with AI</h3>
        <p className="muted">Upload a PDF or provide study text. The AI agent creates a quiz for students without starting an assessment.</p>
        <Link to="/ai-studio" className="btn btn-primary">📄 Upload Document / Open AI Quiz Studio</Link>
      </div>

      <div className="card admin-card">
        <h3>📚 Existing Quizzes</h3>
        <p className="muted">Select a quiz to add questions or remove the quiz.</p>
        <label htmlFor="selectQuiz">Select Quiz</label>
        <div className="quiz-select-row">
          <select id="selectQuiz" value={selectedQuizId} onChange={(event) => setSelectedQuizId(event.target.value)}>
            {!quizzes.length && <option value="">No quizzes available</option>}
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                [{quiz.subject || "General"}] {quiz.title} ({quiz.questionCount} questions · {quiz.durationMinutes || 5} min)
              </option>
            ))}
          </select>
          {selectedQuizId && (
            <button className="btn btn-danger sm" disabled={loading} onClick={() => handleDeleteQuiz(selectedQuizId)}>
              🗑️ Delete Quiz
            </button>
          )}
        </div>
      </div>

      <div className="card admin-card">
        <h3>➕ Add a Question</h3>
        <p className="muted">Add a multiple-choice question to the selected quiz and mark its correct answer.</p>
        {!selectedQuizId ? (
          <p className="muted">Create or select a quiz before adding questions.</p>
        ) : (
          <form className="studio-form" onSubmit={handleAddQuestion}>
            <label htmlFor="adminQuestionText">Question</label>
            <textarea
              id="adminQuestionText"
              rows="3"
              className="raw-textarea"
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              required
            />
            <div className="form-grid">
              {options.map((option, index) => (
                <div key={index}>
                  <label htmlFor={`adminOption${index}`}>Option {String.fromCharCode(65 + index)}</label>
                  <input
                    id={`adminOption${index}`}
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                    required
                  />
                </div>
              ))}
              <div>
                <label htmlFor="correctOption">Correct answer</label>
                <select
                  id="correctOption"
                  value={correctOption}
                  onChange={(event) => setCorrectOption(event.target.value)}
                >
                  {options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !questionText.trim() || options.some((option) => !option.trim())}
            >
              {loading ? "Adding question..." : "Add Question to Quiz"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
