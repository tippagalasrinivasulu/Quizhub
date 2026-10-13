import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Layout from "./Layout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import QuizPlay from "./pages/QuizPlay.jsx";
import Result from "./pages/Result.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Admin from "./pages/Admin.jsx";
import AdminPerformance from "./pages/AdminPerformance.jsx";
import AiStudio from "./pages/AiStudio.jsx";

function Protected({ children, admin, student }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/" replace />;
  if (student && user.role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<Protected student><Dashboard /></Protected>} />
      <Route path="/quizzes" element={<Protected student><Quizzes /></Protected>} />
      <Route path="/ai-studio" element={<Protected><AiStudio /></Protected>} />
      <Route path="/quiz/:id" element={<Protected student><QuizPlay /></Protected>} />
      <Route path="/result" element={<Protected student><Result /></Protected>} />
      <Route path="/leaderboard" element={<Protected student><Leaderboard /></Protected>} />
      <Route path="/analytics" element={<Protected student><Analytics /></Protected>} />
      <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
      <Route path="/admin/performance" element={<Protected admin><AdminPerformance /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
