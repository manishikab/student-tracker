import styles from "../TodoPage.module.css";
import { useState, useEffect, useContext } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../api/todoApi.js";
import { DashboardContext } from "../DashboardContext";
import AiAssistant from "../components/AiAssistant.jsx"; 

export default function TodoPage() {
  const { todoTasks, setTodoTasks } = useContext(DashboardContext);

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [category, setCategory] = useState("upcoming");

  // Fetch todos from backend on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const data = await getTodos();
    setTodos(data);
    // Update dashboard context with current todos
    setTodoTasks(data);
  }

  async function handleAddTodo() {
    if (!newTodo.trim()) return;
    const created = await createTodo({ title: newTodo, completed: false, category });
    const updatedTodos = [...todos, created];
    setTodos(updatedTodos);
    setTodoTasks(updatedTodos); // Update dashboard
    setNewTodo("");
    setCategory("today");
  }

  async function handleToggleComplete(todo) {
    const updated = await updateTodo(todo.id, { ...todo, completed: !todo.completed });
    const updatedTodos = todos.map(t => (t.id === todo.id ? updated : t));
    setTodos(updatedTodos);
    setTodoTasks(updatedTodos); // Update dashboard
  }

  async function handleDelete(todoId) {
    await deleteTodo(todoId);
    const updatedTodos = todos.filter(t => t.id !== todoId);
    setTodos(updatedTodos);
    setTodoTasks(updatedTodos); // Update dashboard
  }

  const todayTodos = todos.filter(todo => todo.category === "today");
  const upcomingTodos = todos.filter(todo => todo.category === "upcoming");

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
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo)}
            />
<span
  className={`${styles.todoText} ${todo.completed ? styles.completed : ""}`}
>
  {todo.title}
</span>
            <button onClick={() => handleDelete(todo.id)} className={styles.button}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Upcoming</h2>
      <ul className={styles.todoList}>
        {upcomingTodos.map((todo) => (
          <li key={todo.id} className={styles.todoItem}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo)}
            />
            <span
              className={`${styles.todoText} ${todo.completed ? styles.completed : ""}`}
            >
              {todo.title}
            </span>
            <button onClick={() => handleDelete(todo.id)} className={styles.button}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {/* AI Assistant */}
    <AiAssistant currentPage="todos" todos={todos} />
    </div>
  );
}