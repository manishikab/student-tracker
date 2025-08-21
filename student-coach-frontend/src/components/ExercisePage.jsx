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
import styles from "../ExercisePage.module.css";

const API_URL = import.meta.env.VITE_FASTAPI_URL;

export default function ExercisePage() {
  const { exerciseEntries, setExerciseEntries } = useContext(DashboardContext);

  const [entries, setEntries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");
  const [notes, setNotes] = useState("");
  const [trend, setTrend] = useState(null);
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  useEffect(() => {
    fetchExerciseEntries();
  }, []);

  async function fetchExerciseEntries() {
    try {
      const res = await fetch(`${API_URL}/exercise/`);
      const data = await res.json();
      const normalized = data.map((e) => ({ ...e, date: e.date.split("T")[0] }));
      const newestFirst = [...normalized].sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(newestFirst);
      setExerciseEntries(newestFirst);
      setChartData(aggregateByDate(normalized));
      calculateTrend(normalized);
    } catch (err) {
      console.error("Failed to fetch exercise entries:", err);
    }
  }

  function aggregateByDate(entries) {
    const grouped = entries.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + Number(e.duration || 0);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async function handleAddEntry() {
    if (!date || !title || !duration || !intensity) return;
    try {
      const res = await fetch(`${API_URL}/exercise/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, title, duration: Number(duration), intensity, notes }),
      });
      const created = await res.json();
      const updatedEntries = [created, ...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(updatedEntries);
      setExerciseEntries(updatedEntries);
      setChartData(aggregateByDate(updatedEntries));
      calculateTrend(updatedEntries);

      setDate("");
      setTitle("");
      setDuration("");
      setIntensity("");
      setNotes("");
    } catch (err) {
      console.error("Failed to add entry:", err);
      alert("Failed to save exercise entry.");
    }
  }

  async function handleDeleteEntry(id) {
    try {
      await fetch(`${API_URL}/exercise/${id}/`, { method: "DELETE" });
      const updatedEntries = entries.filter((e) => e.id !== id);
      setEntries(updatedEntries);
      setExerciseEntries(updatedEntries);
      setChartData(aggregateByDate(updatedEntries));
      calculateTrend(updatedEntries);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  }

  function calculateTrend(entries) {
    if (!entries.length) {
      setTrend(null);
      setWeeklyTotal(0);
      return;
    }
    const now = new Date();
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = entries.filter((e) => new Date(e.date) >= oneWeekAgo);
    const lastWeek = entries.filter((e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < oneWeekAgo);

    const totalThisWeek = thisWeek.reduce((sum, e) => sum + Number(e.duration || 0), 0);
    setWeeklyTotal(totalThisWeek);

    const totalLastWeek = lastWeek.reduce((sum, e) => sum + Number(e.duration || 0), 0);
    if (totalThisWeek > totalLastWeek) setTrend("You're exercising more this week! 💪");
    else if (totalThisWeek < totalLastWeek) setTrend("You exercised less than last week 😅");
    else setTrend("Your exercise is about the same as last week.");
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Exercise Tracker</h1>

      <div className={styles.addEntry}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} />
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={styles.input} />
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (min)" className={styles.input} />
        <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className={styles.input}>
          <option value="">Intensity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className={styles.input} />
        <div className={styles.centerButton}>
          <button onClick={handleAddEntry} className={styles.button}>Add</button>
        </div>
      </div>

      <div className={styles.weeklySummary}>
        Weekly Total: {weeklyTotal} min
        {trend && <div>{trend}</div>}
      </div>

      <div style={{ width: "100%", maxWidth: "600px", height: "300px", marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'dataMax + 10']} />
            <Tooltip />
            <Line type="monotone" dataKey="duration" stroke="#60a5fa" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className={styles.entryList}>
        {entries.map((e) => (
          <li key={e.id} className={styles.entryItem}>
            <div>
              <strong>{e.date}</strong> — {e.title} | {e.duration} min {e.intensity && `| Intensity: ${e.intensity}`}
            </div>
            {e.notes && <div><strong>Notes:</strong> {e.notes}</div>}
            <button onClick={() => handleDeleteEntry(e.id)} className={styles.button}>Delete</button>
          </li>
        ))}
      </ul>

      <AiAssistant currentPage="exercise" />
    </div>
  );
}
