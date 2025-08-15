import { useState, useEffect } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../api/todoApi.js";

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos from backend on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const data = await getTodos();
    setTodos(data);
  }

  async function handleAddTodo() {
    if (!newTodo.trim()) return;
    const created = await createTodo({ title: newTodo, completed: false });
    setTodos([...todos, created]);
    setNewTodo("");
  }

  async function handleToggleComplete(todo) {
    const updated = await updateTodo(todo.id, { ...todo, completed: !todo.completed });
    setTodos(todos.map(t => (t.id === todo.id ? updated : t)));
  }

  async function handleDelete(todoId) {
    await deleteTodo(todoId);
    setTodos(todos.filter(t => t.id !== todoId));
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Todos</h1>

      {/*ADD */}
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task!"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button onClick={handleAddTodo} style={{ padding: "0.5rem"}}>
          Add
        </button>
      </div>

      {/* Todo list */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo)}
              style={{ marginRight: "0.5rem" }}
            />
            <span style={{ textDecoration: todo.completed ? "line-through" : "none", flexGrow: 1 }}>
              {todo.title}
            </span>
            <button onClick={() => handleDelete(todo.id)} style={{ marginLeft: "0.5rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}