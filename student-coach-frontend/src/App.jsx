import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage";
import ExercisePage from "./components/ExercisePage";
import HomePage from "./components/HomePage";
import { DashboardProvider } from "./DashboardContext";
import "./App.css";
import CalendarPage from "./components/CalendarPage";


export default function App() {
  return (
    <DashboardProvider>
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
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/sleep" element={<SleepPage />} />
          <Route path="/wellness" element={<WellnessPage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </Router>
    </DashboardProvider>
  );
}