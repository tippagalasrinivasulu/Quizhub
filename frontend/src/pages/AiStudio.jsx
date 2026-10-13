import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function AiStudio() {
  const nav = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [mode, setMode] = useState("pdf"); // 'pdf' | 'text'
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("Computer Science");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [questionCount, setQuestionCount] = useState(6);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const subjectsList = [
    "Computer Science",
    "Data Structures & Algorithms",
    "Operating Systems",
    "Database Systems",
    "Computer Networks",
    "Electronics & Comm",
    "Mathematics & Logic",
    "GATE & PYQ Papers",
    "General Aptitude"
  ];

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg({ ok: false, t: "Please select a PDF document first." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title.trim()) fd.append("title", title.trim());
      fd.append("subject", subject);
      fd.append("difficulty", difficulty);
      fd.append("durationMinutes", durationMinutes);
      fd.append("questionCount", questionCount);

      const created = await api.upload("/ai/upload-pyq-pdf", fd);
      if (created && created.id) {
        if (isAdmin) {
          setMsg({ ok: true, t: `Created "${created.title}" with ${created.questionCount} questions. It is now available for students.` });
        } else {
          setMsg({ ok: true, t: `Successfully created "${created.title}" with ${created.questionCount} questions! Launching quiz...` });
          nav(`/quiz/${created.id}`);
        }
      } else {
        throw new Error("Failed to generate quiz from document.");
      }
    } catch (err) {
      setMsg({ ok: false, t: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTextGenerate = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setMsg({ ok: false, t: "Please paste your PYQ paper questions or study notes." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const payload = {
        title: title.trim() || `${subject} PYQ Practice`,
        subject,
        difficulty,
        durationMinutes: Number(durationMinutes),
        questionCount: Number(questionCount),
        rawText,
        isPyq: true,
        year: "2024"
      };
      const created = await api.post("/ai/generate-quiz", payload);
      if (created && created.id) {
        if (isAdmin) {
          setMsg({ ok: true, t: `Created "${created.title}" with ${created.questionCount} questions. It is now available for students.` });
        } else {
          setMsg({ ok: true, t: `AI Quiz "${created.title}" generated successfully! Launching quiz...` });
          nav(`/quiz/${created.id}`);
        }
      } else {
        throw new Error("Failed to generate quiz from text.");
      }
    } catch (err) {
      setMsg({ ok: false, t: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">🤖 AI Intelligence Agent</span>
          <h1 className="hero-heading">AI PYQ Paper &amp; PDF Quiz Studio</h1>
          <p className="hero-sub">
            Upload past exam papers, question banks, or notes in PDF format. Our AI Agent instantly extracts questions,
            builds interactive MCQs, and sets time limits.
          </p>
        </div>
      </div>

      {msg && <div className={`msg-banner ${msg.ok ? "msg-success" : "msg-error"}`}>{msg.t}</div>}

      <div className="card studio-card">
        <div className="segmented-tabs">
          <button
            className={`seg-tab ${mode === "pdf" ? "active" : ""}`}
            onClick={() => setMode("pdf")}
          >
            📄 Upload PYQ PDF Paper
          </button>
          <button
            className={`seg-tab ${mode === "text" ? "active" : ""}`}
            onClick={() => setMode("text")}
          >
            ✍️ Paste Paper Text &amp; Notes
          </button>
        </div>

        {mode === "pdf" ? (
          <form onSubmit={handlePdfUpload} className="studio-form">
            <div className="dropzone-box">
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                className="file-input-hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              <label htmlFor="pdfFile" className="dropzone-label">
                <span className="upload-icon">📂</span>
                {file ? (
                  <div>
                    <strong className="file-name">{file.name}</strong>
                    <p className="file-size">({(file.size / 1024).toFixed(1)} KB) &middot; Click to change</p>
                  </div>
                ) : (
                  <div>
                    <strong>Choose a PYQ Exam Paper or Notes PDF</strong>
                    <p className="drop-hint">Supports syllabus, midterm papers, GATE/UPSC/University PYQ PDFs</p>
                  </div>
                )}
              </label>
            </div>

            <div className="form-grid">
              <div>
                <label htmlFor="qTitle">Quiz Title (Optional)</label>
                <input
                  id="qTitle"
                  placeholder="e.g. 2024 Final Examination Mock"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="qSub">Subject</label>
                <select id="qSub" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="qTimer">Set Quiz Time Limit (Minutes)</label>
                <select
                  id="qTimer"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                >
                  <option value="3">3 Minutes (Speed Run)</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes (Standard)</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes (Deep Test)</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <div>
                <label htmlFor="qDiff">Difficulty</label>
                <select id="qDiff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard (Exam Grade)</option>
                </select>
              </div>

              <div>
                <label htmlFor="qCount">Number of Questions to Extract</label>
                <select id="qCount" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}>
                  <option value="4">4 Questions</option>
                  <option value="6">6 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? "⚙️ AI Agent is analyzing PDF & building quiz..." : isAdmin ? "⚡ Generate Quiz for Students" : "⚡ Generate & Start Quiz Now"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTextGenerate} className="studio-form">
            <label htmlFor="rawText">Paste Exam Questions or PYQ Paper Text</label>
            <textarea
              id="rawText"
              rows="7"
              className="raw-textarea"
              placeholder="Example:&#10;Q1. What is the time complexity of QuickSort average case?&#10;A) O(n)  B) O(n log n)  C) O(n^2)  D) O(1)&#10;Answer: B&#10;&#10;Or paste raw study material/syllabus, and our AI will extract MCQs automatically!"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />

            <div className="form-grid">
              <div>
                <label htmlFor="tTitle">Quiz Title</label>
                <input
                  id="tTitle"
                  placeholder="e.g. DBMS Midterm Prep"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="tSub">Subject</label>
                <select id="tSub" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tTimer">Set Quiz Time Limit (Minutes)</label>
                <select
                  id="tTimer"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                >
                  <option value="3">3 Minutes</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                </select>
              </div>

              <div>
                <label htmlFor="tDiff">Difficulty</label>
                <select id="tDiff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || !rawText.trim()}>
              {loading ? "⚙️ AI Agent is generating questions..." : isAdmin ? "⚡ Generate Quiz for Students" : "⚡ Generate & Start Quiz Now"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
