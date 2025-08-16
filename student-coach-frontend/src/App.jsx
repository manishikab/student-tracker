import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./components/TodoPage";
import SleepPage from "./components/SleepPage";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/todos">Todos</Link> |{" "}
        <Link to="/sleep">Sleep Tracker</Link> |{" "}
      </nav>
      <Routes>
        <Route path="/todos" element={<TodoPage/>} />
        <Route path="/sleep" element={<SleepPage/>} />
      </Routes>
    </Router>
  );
}