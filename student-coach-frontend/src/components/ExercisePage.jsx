import styles from "../ExercisePage.module.css";
import { useState, useEffect } from "react";
import { getExerciseEntries, postExerciseEntry, deleteExerciseEntry } from "../api/exerciseApi.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ExercisePage() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");
  const [notes, setNotes] = useState("");
  const [trend, setTrend] = useState(null);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExerciseEntries();
  }, []);

  async function fetchExerciseEntries() {
  const data = await getExerciseEntries();
  // Make sure duration is a number
  const normalized = data.map((e) => ({
    ...e,
    duration: Number(e.duration) || 0,
  }));
  const sorted = normalized.sort((a, b) => new Date(a.date) - new Date(b.date));
  setEntries(sorted);
  calculateTrend(sorted);
}

  async function handleAddEntry() {
    if (!date || !title || !duration) {
      setError("Date, Title, and Duration are required.");
      return;
    }
    if (duration <= 0 || duration > 360) {
      setError("Duration must be between 1 and 360 minutes.");
      return;
    }

    const created = await postExerciseEntry({
  date,
  title,
  duration,  // already a number
  intensity: intensity || null,
  notes: notes || null,
});

   const updated = [...entries, {
  ...created,
  duration: Number(created.duration) || 0
}].sort((a, b) => new Date(a.date) - new Date(b.date));

    setEntries(updated);
    setDate("");
    setTitle("");
    setDuration("");
    setIntensity("");
    setNotes("");
    setError("");
    calculateTrend(updated);
  }

  async function handleDeleteEntry(id) {
    await deleteExerciseEntry(id);
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    calculateTrend(updated);
  }

  function calculateTrend(entries) {
    if (!entries.length) {
      setTrend(null);
      setWeeklyTotal(0);
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = entries.filter((e) => new Date(e.date) >= oneWeekAgo);
    const lastWeek = entries.filter(
      (e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < oneWeekAgo
    );

    const totalThisWeek = thisWeek.reduce((sum, e) => sum + e.duration, 0);
    const totalLastWeek = lastWeek.reduce((sum, e) => sum + e.duration, 0);

    setWeeklyTotal(totalThisWeek);

    if (totalThisWeek > totalLastWeek) {
      setTrend("You're exercising more this week! 💪");
    } else if (totalThisWeek < totalLastWeek) {
      setTrend("You exercised less than last week 😅");
    } else {
      setTrend("Your exercise is about the same as last week.");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Exercise Tracker</h1>

      {/* Add Exercise Entry */}
      <div className={styles.addEntry}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className={styles.input}
        />
        <input
  type="number"
  value={duration}
  onChange={(e) => setDuration(Number(e.target.value))}
  placeholder="Duration (min)"
  className={styles.input}
/>
        <select
          value={intensity}
          onChange={(e) => setIntensity(e.target.value)}
          className={styles.input}
        >
          <option value="">Intensity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className={styles.input}
        />

        <button onClick={handleAddEntry} className={styles.button}>
          Add
        </button>
        {error && <div style={{ color: "red", marginTop: "0.5rem" }}>{error}</div>}
      </div>

      {/* Weekly total and trend */}
      <div style={{ textAlign: "center", margin: "1rem 0", fontWeight: "bold" }}>
        Weekly Total: {weeklyTotal} min
        {trend && <div>{trend}</div>}
      </div>

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: "600px", height: "300px", marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={entries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'dataMax + 10']} />

            <Tooltip />
            <Line type="monotone" dataKey="duration" stroke="#60a5fa" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Entries List */}
      <ul className={styles.entryList}>
        {entries.map((e) => (
          <li key={e.id} className={styles.entryItem}>
            <div>
              <strong>{e.date}</strong> — {e.title} | {e.duration} min{" "}
              {e.intensity && `| Intensity: ${e.intensity}`}
            </div>
            {e.notes && <div>Notes: {e.notes}</div>}
            <button onClick={() => handleDeleteEntry(e.id)} className={styles.button}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}