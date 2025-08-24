import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage";
import ExercisePage from "./components/ExercisePage";
import HomePage from "./components/HomePage";
import CalendarPage from "./components/CalendarPage";
import Login from "./components/Login";
import { DashboardProvider } from "./DashboardContext";
import "./App.css";

// Create a context to share the Firebase token
export const AuthContext = createContext(null);

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <AuthContext.Provider value={token}>
      <DashboardProvider>
        <Router>
          {!token ? (
            // If not logged in, show login page
            <Login onLogin={setToken} />
          ) : (
            <>
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
              </nav>

              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/todos" element={<TodoPage token={token} />} />
                <Route path="/sleep" element={<SleepPage token={token} />} />
                <Route path="/wellness" element={<WellnessPage token={token} />} />
                <Route path="/exercise" element={<ExercisePage token={token} />} />
                <Route path="/calendar" element={<CalendarPage token={token} />} />
                {/* Redirect any unknown route to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
          )}
        </Router>
      </DashboardProvider>
    </AuthContext.Provider>
  );
}

// Custom hook to access auth token from any component
export function useAuth() {
  return useContext(AuthContext);
}
