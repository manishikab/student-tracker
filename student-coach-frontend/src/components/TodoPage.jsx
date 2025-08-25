import styles from "../TodoPage.module.css";
import React, { useState, useEffect, useContext } from "react";
import { DashboardContext } from "../DashboardContext";
import AiAssistant from "../components/AiAssistant.jsx";

export default function TodoPage() {
  const { todoTasks, setTodoTasks, authFetch } = useContext(DashboardContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [category, setCategory] = useState("upcoming");

  // Fetch todos once on mount
  useEffect(() => {
    async function fetchTodos() {
      try {
        const data = await authFetch("/todos/");
        setTodos(data);
        setTodoTasks(data);
      } catch (err) {
        console.error("Failed to fetch todos:", err);
      }
    }

    fetchTodos();
  }, [authFetch, setTodoTasks]);

  // Add new todo
  async function handleAddTodo() {
    if (!newTodo.trim()) return;
    try {
      const created = await authFetch("/todos/", {
        method: "POST",
        body: JSON.stringify({ title: newTodo, completed: false, category }),
      });

      const updatedTodos = [...todos, created];
      setTodos(updatedTodos);
      setTodoTasks(updatedTodos);

      setNewTodo("");
      setCategory("today");
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  }

  // Toggle completion
  async function handleToggleComplete(todo) {
    try {
      const updated = await authFetch(`/todos/${todo.id}/`, {
        method: "PUT",
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });

      const updatedTodos = todos.map((t) => (t.id === todo.id ? updated : t));
      setTodos(updatedTodos);
      setTodoTasks(updatedTodos);
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  }

  // Delete todo
  async function handleDelete(todoId) {
    try {
      await authFetch(`/todos/${todoId}/`, { method: "DELETE" });
      const updatedTodos = todos.filter((t) => t.id !== todoId);
      setTodos(updatedTodos);
      setTodoTasks(updatedTodos);
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  }

  // Split by category
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
