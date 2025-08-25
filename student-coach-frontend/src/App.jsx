import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage";
import ExercisePage from "./components/ExercisePage";
import HomePage from "./components/HomePage";
import CalendarPage from "./components/CalendarPage";
import Login from "./components/Login";
import { DashboardProvider } from "./DashboardContext";
import "./App.css";
import { auth } from "./firebase";

export const AuthContext = createContext(null);

export default function App() {
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
      setAuthChecked(true); // auth check is done
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    // Optionally show a loading spinner while Firebase checks auth
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={token}>
      <DashboardProvider>
        <Router>
          {!token ? (
            <Login />
          ) : (
            <>
              <nav className="navbar">
                <NavLink to="/" end className="nav-link">Home</NavLink>
                <NavLink to="/calendar" className="nav-link">Calendar</NavLink>
                <NavLink to="/todos" className="nav-link">Todos</NavLink>
                <NavLink to="/sleep" className="nav-link">Sleep</NavLink>
                <NavLink to="/wellness" className="nav-link">Wellness</NavLink>
                <NavLink to="/exercise" className="nav-link">Exercise</NavLink>
              </nav>

              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/todos" element={<TodoPage />} />
                <Route path="/sleep" element={<SleepPage />} />
                <Route path="/wellness" element={<WellnessPage />} />
                <Route path="/exercise" element={<ExercisePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
          )}
        </Router>
      </DashboardProvider>
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
