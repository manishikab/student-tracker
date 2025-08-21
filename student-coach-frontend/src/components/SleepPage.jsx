import styles from "../SleepPage.module.css";
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

export default function SleepPage() {
  const { sleepEntries, setSleepEntries } = useContext(DashboardContext);

  const [sleeps, setSleeps] = useState([]);
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [average, setAverage] = useState(null);
  const [trend, setTrend] = useState(null);
  const [goal, setGoal] = useState(() => Number(localStorage.getItem("sleepGoal")) || 8);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchSleepEntries();
    fetchSleepAverage();
  }, []);

  async function fetchSleepEntries() {
    try {
      const res = await fetch(`${API_URL}/sleep/`);
      const data = await res.json();
      const normalized = data.map((s) => ({ ...s, date: s.date.split("T")[0] }));
      setSleeps(normalized);
      setSleepEntries(normalized);
      setChartData(aggregateByDate(normalized));
      calculateTrend(normalized);
    } catch (err) {
      console.error("Failed to fetch sleep entries:", err);
    }
  }

  async function fetchSleepAverage() {
    try {
      const res = await fetch(`${API_URL}/sleep/average/`);
      const avg = await res.json();
      setAverage(avg);
    } catch (err) {
      console.error("Failed to fetch sleep average:", err);
    }
  }

  async function handleAddSleep() {
    if (!hours || !date) return;
    if (hours < 0 || hours > 24) return;

    try {
      const res = await fetch(`${API_URL}/sleep/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: Number(hours), date }),
      });
      const newEntry = await res.json();
      const updated = [...sleeps, { ...newEntry, date: newEntry.date.split("T")[0] }];
      setSleeps(updated);
      setSleepEntries(updated);
      setChartData(aggregateByDate(updated));
      calculateTrend(updated);
      setHours("");
      setDate("");
      fetchSleepAverage();
    } catch (err) {
      console.error("Failed to add sleep entry:", err);
      alert("Failed to save sleep entry.");
    }
  }

  async function handleDeleteSleep(id) {
    try {
      await fetch(`${API_URL}/sleep/${id}/`, { method: "DELETE" });
      const updated = sleeps.filter((s) => s.id !== id);
      setSleeps(updated);
      setSleepEntries(updated);
      setChartData(aggregateByDate(updated));
      calculateTrend(updated);
      fetchSleepAverage();
    } catch (err) {
      console.error("Failed to delete sleep entry:", err);
    }
  }

  function aggregateByDate(entries) {
    const grouped = entries.reduce((acc, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.hours;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([date, hours]) => ({ date, hours }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function calculateTrend(entries) {
    if (!entries.length) {
      setTrend(null);
      setHours(0);
      return;
    }
    const now = new Date();
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = entries.filter((s) => new Date(s.date) >= oneWeekAgo);
    const lastWeek = entries.filter((s) => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo);

    const avgThisWeek = thisWeek.reduce((sum, s) => sum + s.hours, 0) / (thisWeek.length || 1);
    const avgLastWeek = lastWeek.reduce((sum, s) => sum + s.hours, 0) / (lastWeek.length || 1);

    if (avgThisWeek > avgLastWeek) setTrend("You’re sleeping better this week :)");
    else if (avgThisWeek < avgLastWeek) setTrend("You’re sleeping less than last week :(");
    else setTrend("Your sleep is about the same as last week!");

    setHours(avgThisWeek);
  }

  function handleGoalChange(e) {
    const newGoal = Number(e.target.value);
    setGoal(newGoal);
    localStorage.setItem("sleepGoal", newGoal);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Sleep Tracker</h1>

      {/* Add Sleep */}
      <div className={styles.addSleep}>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours slept (0-24)"
          className={styles.input}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAddSleep} className={styles.button}>Add</button>
      </div>

      {/* Sleep Goal */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label>
          Sleep Goal:{" "}
          <input
            type="number"
            value={goal}
            min="0"
            max="24"
            onChange={handleGoalChange}
            className={styles.input}
            style={{ width: "60px", marginLeft: "0.5rem" }}
          /> hrs
        </label>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: "600px", height: "300px", marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 12]} />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#f472b6" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Message */}
      {trend && <div style={{ marginBottom: "1rem", fontWeight: "bold", textAlign: "center" }}>{trend}</div>}

      {/* Sleep Entries */}
      <ul className={styles.sleepList}>
        {sleeps.map((s) => (
          <li key={s.id} className={styles.sleepItem}>
            <span>
              <strong>{s.date}</strong> —{" "}
              <span style={{ color: s.hours < 6 ? "red" : "green" }}>{s.hours} hours</span>
            </span>
            <button onClick={() => handleDeleteSleep(s.id)} className={styles.button}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Weekly average + goal check */}
      {average && (
        <div className={styles.average}>
          Weekly Average: {average.average_hours} hrs{" "}
          {average.average_hours >= goal ? "- goal met!" : "- try to get more sleep tonight!"}
        </div>
      )}

      <AiAssistant currentPage="sleep" />
    </div>
  );
}
