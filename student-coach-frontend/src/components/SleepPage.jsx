import styles from "../SleepPage.module.css";

import { useState, useEffect , useContext} from "react";
import { getSleepEntries, postSleepEntry, getSleepAverage, deleteSleepEntry} from "../api/sleepApi.js";

import { DashboardContext } from "../DashboardContext";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function SleepPage() {
  const { sleepHours, setSleepHours } = useContext(DashboardContext)
  const [sleeps, setSleeps] = useState([]);
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [average, setAverage] = useState(null);
  const [error, setError] = useState("");
  const [goal, setGoal] = useState(8); // 🎯 Default sleep goal
  const [trend, setTrend] = useState(null);

  // Fetch sleep entries from backend on mount
  useEffect(() => {
    fetchSleepEntries();
    fetchSleepAverage();
  }, []);

  async function fetchSleepEntries() {
    const data = await getSleepEntries();
    const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));

    setSleeps(sorted);
    calculateTrend(sorted);
  }

  async function fetchSleepAverage(){
    const avg = await getSleepAverage();
    setAverage(avg);
  }

  async function handleAddSleep() {
    if (!hours || !date) return;
    if (hours < 0 || hours > 24) {
    setError("Hours must be between 0 and 24");
    return;
  }

  try {
    const created = await postSleepEntry({ hours: Number(hours), date });
    setSleeps([...sleeps, created]);
    setHours("");
    setDate("");
    fetchSleepAverage();
  } catch (err) {
    console.error(err);
    alert("Failed to save sleep entry.");
  }
    const updated = [...sleeps, created].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setSleeps(updated);
    setHours("");
    setDate("");
    fetchSleepAverage();
    calculateTrend(updated)
  }

  async function handleDeleteSleep(id) {
    await deleteSleepEntry(id);
    const updated = sleeps.filter((s) => s.id !== id);
    setSleeps(updated);
    fetchSleepAverage(); 
    calculateTrend(updated);
  }

  // 📈 Calculate trend (this week vs last week average)
  function calculateTrend(entries) {
    if (!entries.length) {
      setTrend(null);
      setExerciseMinutes(0);
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = entries.filter(
      (s) => new Date(s.date) >= oneWeekAgo
    );
    const lastWeek = entries.filter(
      (s) => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo
    );

    const avgThisWeek =
      thisWeek.reduce((sum, s) => sum + s.hours, 0) /
      (thisWeek.length || 1);

    const avgLastWeek =
      lastWeek.reduce((sum, s) => sum + s.hours, 0) /
      (lastWeek.length || 1);

    if (avgThisWeek > avgLastWeek) {
      setTrend("You’re sleeping better this week :)");
    } else if (avgThisWeek < avgLastWeek) {
      setTrend("You’re sleeping less than last week :(");
    } else {
      setTrend("Your sleep is about the same as last week!");
    }

    setSleepHours(avgThisWeek);
    
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
          placeholder="Hours slept"
          className={styles.input}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAddSleep} className={styles.button}>
          Add
        </button>
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
  onChange={(e) => {
    const val = Number(e.target.value);
    if (val >= 0 && val <= 24) {
      setGoal(val);
    }
  }}
  className={styles.input}
  style={{ width: "60px", marginLeft: "0.5rem" }}
/>
          hrs
        </label>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: "600px", height: "300px", marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <LineChart data={sleeps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 12]} />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#f472b6" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Message */}
      {trend && (
        <div style={{ marginBottom: "1rem", fontWeight: "bold", textAlign: "center" }}>
          {trend}
        </div>
      )}

      {/* Sleep Entries list */}
      <ul className={styles.sleepList}>
        {sleeps.map((s) => (
          <li key={s.id} className={styles.sleepItem}>
            <span>
              <strong>{s.date}</strong> —{" "}
              <span style={{ color: s.hours < 6 ? "red" : "green" }}>
                {s.hours} hours
              </span>
            </span>
            <button
              onClick={() => handleDeleteSleep(s.id)}
              className={styles.button}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Weekly average + goal check */}
      {average && (
        <div className={styles.average}>
          Weekly Average: {average.average_hours} hrs{" "}
          {average.average_hours >= goal ? "🎉 Goal met!" : "💤 Keep going!"}
        </div>
      )}
    </div>
  );
}