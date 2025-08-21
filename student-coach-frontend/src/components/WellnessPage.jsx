import styles from "../WellnessPage.module.css";
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

// Use deployed FastAPI URL from env
const API_URL = import.meta.env.VITE_FASTAPI_URL;

export default function WellnessPage() {
  const { wellnessStatus, setWellnessStatus } = useContext(DashboardContext);

  const [entries, setEntries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch(`${API_URL}/wellness/`);
      const data = await res.json();

      // Entries list: newest first
      const newestFirst = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(newestFirst);

      // Chart: oldest first
      const chronological = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      setChartData(chronological);

      calculateTrend(newestFirst);
    } catch (err) {
      console.error("Failed to fetch wellness entries:", err);
    }
  }

  async function handleAddEntry() {
    if (!date || mood === "" || energy === "") return;

    const moodVal = Math.min(Math.max(Number(mood), 0), 10);
    const energyVal = Math.min(Math.max(Number(energy), 0), 10);

    try {
      const res = await fetch(`${API_URL}/wellness/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, mood: moodVal, energy: energyVal, notes: notes || null }),
      });
      const created = await res.json();

      const updatedEntries = [created, ...entries].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEntries(updatedEntries);

      const updatedChart = [...updatedEntries].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setChartData(updatedChart);

      setMood("");
      setEnergy("");
      setDate("");
      setNotes("");
      calculateTrend(updatedEntries);
    } catch (err) {
      console.error("Failed to add wellness entry:", err);
    }
  }

  async function handleDeleteEntry(id) {
    try {
      await fetch(`${API_URL}/wellness/${id}/`, { method: "DELETE" });

      const updatedEntries = entries.filter((e) => e.id !== id);
      setEntries(updatedEntries);

      const updatedChart = [...updatedEntries].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setChartData(updatedChart);

      calculateTrend(updatedEntries);
    } catch (err) {
      console.error("Failed to delete wellness entry:", err);
    }
  }

  function calculateTrend(entries) {
    if (!entries.length) {
      setTrend(null);
      setWellnessStatus(0);
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const thisWeek = entries.filter((e) => new Date(e.date) >= oneWeekAgo);
    if (!thisWeek.length) {
      setTrend(null);
      setWellnessStatus(0);
      return;
    }

    const avgMood = thisWeek.reduce((sum, e) => sum + e.mood, 0) / thisWeek.length;
    const avgEnergy = thisWeek.reduce((sum, e) => sum + e.energy, 0) / thisWeek.length;

    let message = "";
    if (avgMood >= 7 && avgEnergy >= 7) message = "Great week! You’re feeling good 😄";
    else if (avgMood < 5 || avgEnergy < 5) message = "Hmm… a bit low this week. Take care 💛";
    else message = "Steady week! Keep it up 🙂";

    setTrend(message);
    setWellnessStatus(avgMood);
  }

  const moodEmoji = (val) => (val >= 8 ? "😄" : val >= 5 ? "😐" : "😞");
  const energyEmoji = (val) => (val >= 8 ? "⚡" : val >= 5 ? "🙂" : "😴");

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Wellness Journal</h1>

      {/* Add Entry */}
      <div className={styles.addEntry}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mood (0–10)"
          className={styles.input}
          min={0}
          max={10}
        />
        <input
          type="number"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
          placeholder="Energy (0–10)"
          className={styles.input}
          min={0}
          max={10}
        />
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
      </div>

      {trend && (
        <div style={{ marginBottom: "1rem", fontWeight: "bold", textAlign: "center" }}>
          {trend}
        </div>
      )}

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: "600px", height: "300px", marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={2} dot />
            <Line type="monotone" dataKey="energy" stroke="#34d399" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Entries list */}
      <ul className={styles.entryList}>
        {entries.map((e) => (
          <li key={e.id} className={styles.entryItem}>
            <div>
              <strong>{e.date}</strong> — Mood: {e.mood} {moodEmoji(e.mood)} | Energy: {e.energy} {energyEmoji(e.energy)}
            </div>
            {e.notes && <div><strong>Notes:</strong> {e.notes}</div>}
            <button onClick={() => handleDeleteEntry(e.id)} className={styles.button}>Delete</button>
          </li>
        ))}
      </ul>

      <AiAssistant currentPage="wellness" />
    </div>
  );
}
