import styles from "../ExercisePage.module.css";
import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "../DashboardContext";
import AiAssistant from "../components/AiAssistant.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_FASTAPI_URL;

export default function ExercisePage() {
  const { exerciseEntries, setExerciseEntries } = useContext(DashboardContext);

  const [exercises, setExercises] = useState([]);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [trend, setTrend] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [goal, setGoal] = useState(() => Number(localStorage.getItem("exerciseGoal")) || 150); // weekly minutes

  useEffect(() => {
    fetchExerciseEntries();
  }, []);

  async function fetchExerciseEntries() {
    try {
      const res = await fetch(`${API_URL}/exercise/`);
      const data = await res.json();
      const normalized = data.map((e) => ({ ...e, date: e.date.split("T")[0] }));
      setExercises(normalized);
      setExerciseEntries(normalized);
      setChartData(aggregateByDate(normalized));
      calculateTrend(normalized);
    } catch (err) {
      console.error("Failed to fetch exercise entries:", err);
    }
  }

  async function handleAddExercise() {
    if (!duration || !date) return;
    if (duration < 0) return;

    try {
      const res = await fetch(`${API_URL}/exercise/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: Number(duration), date }),
      });
      const newEntry = await res.json();
      const updated = [...exercises, { ...newEntry, date: newEntry.date.split("T")[0] }];
      setExercises(updated);
      setExerciseEntries(updated);
      setChartData(aggregateByDate(updated));
      calculateTrend(updated);
      setDuration("");
      setDate("");
    } catch (err) {
      console.error("Failed to add exercise entry:", err);
      alert("Failed to save exercise entry.");
    }
  }

  async function handleDeleteExercise(id) {
    try {
      await fetch(`${API_URL}/exercise/${id}/`, { method: "DELETE" });
      const updated = exercises.filter((e) => e.id !== id);
      setExercises(updated);
      setExerciseEntries(updated);
      setChartData(aggregateByDate(updated));
      calculateTrend(updated);
    } catch (err) {
      console.error("Failed to delete exercise entry:", err);
    }
  }

  function aggregateByDate(entries) {
    const grouped = entries.reduce((acc, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.duration;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function calculateTrend(entries) {
    if (!entries.length) {
      setTrend(null);
      return;
    }
    const now = new Date();
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = entries.filter((e) => new Date(e.date) >= oneWeekAgo);
    const lastWeek = entries.filter((e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < oneWeekAgo);

    const totalThisWeek = thisWeek.reduce((sum, e) => sum + e.duration, 0);
    const totalLastWeek = lastWeek.reduce((sum, e) => sum + e.duration, 0);

    if (totalThisWeek > totalLastWeek) setTrend("You exercised more this week! 💪");
    else if (totalThisWeek < totalLastWeek) setTrend("Exercise decreased this week 😕");
    else setTrend("Your exercise is about the same as last week.");

  }

  function handleGoalChange(e) {
    const newGoal = Number(e.target.value);
    setGoal(newGoal);
    localStorage.setItem("exerciseGoal", newGoal);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Exercise Tracker</h1>

      {/* Add Exercise */}
      <div className={styles.addExercise}>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (minutes)"
          className={styles.input}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAddExercise} className={styles.button}>Add</button>
      </div>

      {/* Weekly Goal */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label>
          Weekly Goal:{" "}
          <input
            type="number"
            value={goal}
            min="0"
            onChange={handleGoalChange}
            className={styles.input}
            style={{ width: "80px", marginLeft: "0.5rem" }}
          /> minutes
        </label>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: "600px", height: "300px", marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 120]} />
            <Tooltip />
            <Line type="monotone" dataKey="duration" stroke="#34d399" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend */}
      {trend && <div style={{ marginBottom: "1rem", fontWeight: "bold", textAlign: "center" }}>{trend}</div>}

      {/* Exercise Entries */}
      <ul className={styles.exerciseList}>
        {exercises.map((e) => (
          <li key={e.id} className={styles.exerciseItem}>
            <span>
              <strong>{e.date}</strong> — {e.duration} mins
            </span>
            <button onClick={() => handleDeleteExercise(e.id)} className={styles.button}>Delete</button>
          </li>
        ))}
      </ul>

      <AiAssistant currentPage="exercise" />
    </div>
  );
}
