import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage"
import ExercisePage from "./components/ExercisePage";

import HomePage from "./components/HomePage";


export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
        <Link to="/todos">Todos</Link> |{" "}
        <Link to="/sleep">Sleep Tracker</Link> |{" "}
        <Link to="/wellness">Wellness Tracker</Link> |{" "}
        <Link to="/exercise">Exercise Tracker</Link> |{" "}

      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todos" element={<TodoPage/>} />
        <Route path="/sleep" element={<SleepPage/>} />
        <Route path="/wellness" element={<WellnessPage/>} />
        <Route path="/exercise" element={<ExercisePage/>} />
      </Routes>
    </Router>
  );
}