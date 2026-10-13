import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AdminPerformance() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/students/performance")
      .then(setStudents)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const handleViewAttempts = async (student) => {
    setSelectedStudent(student);
    setStudentAttempts([]);
    setAttemptsLoading(true);
    setError("");
    try {
      const attempts = await api.get(`/admin/students/${encodeURIComponent(student.username)}/results`);
      setStudentAttempts(attempts);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAttemptsLoading(false);
    }
  };

  return (
    <div className="page-container admin-page">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">🎓 Student Reports</span>
          <h1 className="hero-heading">Student Performance</h1>
          <p className="hero-sub">Review quiz completion, average accuracy, and individual student attempts.</p>
        </div>
      </div>

      {error && <div className="msg-banner msg-error">{error}</div>}

      <div className="card admin-card">
        {loading ? (
          <p className="muted">Loading student performance…</p>
        ) : students.length === 0 ? (
          <p className="muted">No student accounts found.</p>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quizzes Completed</th>
                  <th>Average Accuracy</th>
                  <th>Last Attempt</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.username}>
                    <td><b>{student.username}</b><br /><span className="muted">{student.email}</span></td>
                    <td>{student.quizzesCompleted}</td>
                    <td>{student.averagePercent}%</td>
                    <td>{student.lastAttempt ? new Date(student.lastAttempt).toLocaleString() : "No attempts"}</td>
                    <td>
                      <button className="btn btn-secondary sm" onClick={() => handleViewAttempts(student)}>
                        View Attempts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="card admin-card">
          <h3>{selectedStudent.username} — Quiz Attempts</h3>
          {attemptsLoading ? (
            <p className="muted">Loading attempts…</p>
          ) : studentAttempts.length === 0 ? (
            <p className="muted">No attempts recorded for this student.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Quiz</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>{new Date(attempt.takenAt).toLocaleString()}</td>
                      <td>{attempt.quiz}</td>
                      <td>{attempt.subject || "General"}</td>
                      <td>{attempt.score}/{attempt.total}</td>
                      <td>{attempt.percent}%</td>
                      <td>{attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
