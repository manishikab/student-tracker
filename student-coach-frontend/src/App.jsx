import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from "react-router-dom";
import { createContext, useContext } from "react";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage";
import ExercisePage from "./components/ExercisePage";
import HomePage from "./components/HomePage";
import CalendarPage from "./components/CalendarPage";
import Login from "./components/Login";
import { DashboardProvider } from "./DashboardContext";
import "./App.css";
import { useAuth } from "./useAuth";   // <-- import the hook we created

// Create a context to share the Firebase token
export const AuthContext = createContext(null);

export default function App() {
  const token = useAuth();   // <-- get token directly from Firebase

  return (
    <AuthContext.Provider value={token}>
      <DashboardProvider>
        <Router>
          {!token ? (
            // If not logged in, show login page
            <Login />
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
                <Route path="/todos" element={<TodoPage />} />
                <Route path="/sleep" element={<SleepPage />} />
                <Route path="/wellness" element={<WellnessPage />} />
                <Route path="/exercise" element={<ExercisePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
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
export function useAuthContext() {
  return useContext(AuthContext);
}
