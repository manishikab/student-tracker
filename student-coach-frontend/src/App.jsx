import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TodoPage from "./components/TodoPage";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/todos">Todos</Link> |{" "}
      </nav>
      <Routes>
        <Route path="/todos" element={<TodoPage/>} />
      </Routes>
    </Router>
  );
}