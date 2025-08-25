import styles from "../TodoPage.module.css";
import React, { useState, useEffect, useContext } from "react";
import { DashboardContext } from "../DashboardContext";
import AiAssistant from "../components/AiAssistant.jsx";
import { AuthContext } from "../App"; // custom hook from App.jsx

const API_URL = import.meta.env.VITE_FASTAPI_URL;

export default function TodoPage() {
  const { todoTasks, setTodoTasks } = useContext(DashboardContext);
  const token = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [category, setCategory] = useState("upcoming");

  useEffect(() => {
    if (token) fetchTodos(); // only fetch if token exists
  }, [token]);

  async function fetchTodos() {
    try {
      const res = await fetch(`${API_URL}/todos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
      setTodoTasks(data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    }
  }

  async function handleAddTodo() {
    if (!newTodo.trim()) return;
    try {
      const res = await fetch(`${API_URL}/todos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodo, completed: false, category }),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      const created = await res.json();
      const updatedTodos = [...todos, created];
      setTodos(updatedTodos);
      setTodoTasks(updatedTodos);
      setNewTodo("");
      setCategory("today");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleComplete(todo) {
    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      const updatedTodos = todos.map((t) => (t.id === todo.id ? updated : t));
      setTodos(updatedTodos);
      setTodoTasks(updatedTodos);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(todoId) {
    try {
      await fetch(`${API_URL}/todos/${todoId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedTodos = todos.filter((t) => t.id !== todoId);
      setTodos(updatedTodos);
      setTodoTasks(updatedTodos);
    } catch (err) {
      console.error(err);
    }
  }

  const todayTodos = todos.filter((todo) => todo.category === "today");
  const upcomingTodos = todos.filter((todo) => todo.category === "upcoming");

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Todos</h1>

      <div className={styles.addTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task!"
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          className={styles.input}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
        >
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <button
          onClick={handleAddTodo}
          disabled={!newTodo.trim()}
          className={styles.button}
        >
          Add
        </button>
      </div>

      <h2>Due Today</h2>
      <ul className={styles.todoList}>
        {todayTodos.map((todo) => (
          <li key={todo.id} className={styles.todoItem}>
            <div className={styles.todoLeft}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
              />
              <span
                className={`${styles.todoText} ${
                  todo.completed ? styles.completed : ""
                }`}
              >
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
              className={styles.button}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Upcoming</h2>
      <ul className={styles.todoList}>
        {upcomingTodos.map((todo) => (
          <li key={todo.id} className={styles.todoItem}>
            <div className={styles.todoLeft}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
              />
              <span
                className={`${styles.todoText} ${
                  todo.completed ? styles.completed : ""
                }`}
              >
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
              className={styles.button}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <AiAssistant currentPage="todos" todos={todos} />
    </div>
  );
}
