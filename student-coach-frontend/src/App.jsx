import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from "react-router-dom";
import { useContext } from "react";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage";
import ExercisePage from "./components/ExercisePage";
import HomePage from "./components/HomePage";
import CalendarPage from "./components/CalendarPage";
import Login from "./components/Login";
import { DashboardProvider, DashboardContext } from "./DashboardContext";
import "./App.css";
import { auth, signOut } from "./firebase";

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

// Separate component to consume DashboardContext
function DashboardContent() {
  const { token, loadingAuth, setToken } = useContext(DashboardContext);

  // Show loading screen while Firebase auth initializes
  if (loadingAuth) return <p>Loading...</p>;

  // Show login if not authenticated
  if (!token) return <Login />;

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);  // Firebase logout
      setToken(null);       // clear context token to show Login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // User is logged in, show dashboard
  return (
    <Router>
      <nav className="navbar">
        <NavLink to="/" end className="nav-link">
          Home
        </NavLink>
        <NavLink to="/calendar" className="nav-link">
          Calendar
        </NavLink>
        <NavLink to="/todos" className="nav-link">
          Todos
        </NavLink>
        <NavLink to="/sleep" className="nav-link">
          Sleep
        </NavLink>
        <NavLink to="/wellness" className="nav-link">
          Wellness
        </NavLink>
        <NavLink to="/exercise" className="nav-link">
          Exercise
        </NavLink>

        {/* ✅ Logout button */}
        <button onClick={handleLogout} className="nav-link">
          Logout
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/sleep" element={<SleepPage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/exercise" element={<ExercisePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        {/* Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}