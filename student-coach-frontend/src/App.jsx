import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";
import WellnessPage from "./components/WellnessPage"

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/todos">Todos</Link> |{" "}
        <Link to="/sleep">Sleep Tracker</Link> |{" "}
        <Link to="/wellness">Wellness Tracker</Link> |{" "}
      </nav>
      <Routes>
        <Route path="/todos" element={<TodoPage/>} />
        <Route path="/sleep" element={<SleepPage/>} />
        <Route path="/wellness" element={<WellnessPage/>} />
      </Routes>
    </Router>
  );
}