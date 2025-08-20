import styles from "../SleepPage.module.css";
import { useState, useEffect, useContext } from "react";
import { getSleepEntries, postSleepEntry, getSleepAverage, deleteSleepEntry } from "../api/sleepApi.js";
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

import AiAssistant from "../components/AiAssistant.jsx";

export default function SleepPage() {
  const { sleepEntries, setSleepEntries } = useContext(DashboardContext);

  const [sleeps, setSleeps] = useState([]);
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [average, setAverage] = useState(null);
  const [trend, setTrend] = useState(null);
  const [goal, setGoal] = useState(8);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchSleepEntries();
    fetchSleepAverage();
  }, []);

  async function fetchSleepEntries() {
    try {
      const data = await getSleepEntries();
      const normalized = data.map((s) => ({ ...s, date: normalizeDate(s.date) }));
      setSleeps(normalized);
      setSleepEntries(normalized); // update context
      setChartData(aggregateByDate(normalized));
      calculateTrend(normalized);
    } catch (err) {
      console.error("Failed to fetch sleep entries:", err);
    }
  }

  async function fetchSleepAverage() {
    try {
      const avg = await getSleepAverage();
      setAverage(avg);
    } catch (err) {
      console.error("Failed to fetch average:", err);
    }
  }

  function normalizeDate(d) {
    return new Date(d).toISOString().split("T")[0];
  }

  async function handleAddSleep() {
    if (!hours || !date) return;
    if (hours < 0 || hours > 24) return;

    try {
      console.log({ hours: Number(hours), date });
      const newEntry = await postSleepEntry({ hours: Number(hours), date });
      if (!newEntry.id) {
        // fallback id if API doesn’t return one
        newEntry.id = Date.now();
      }
      newEntry.date = normalizeDate(newEntry.date);
      const updated = [...sleeps, newEntry];
      setSleeps(updated);
      setSleepEntries(updated); // persist in context
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
      await deleteSleepEntry(id);
      const updated = sleeps.filter((s) => s.id !== id);
      setSleeps(updated);
      setSleepEntries(updated); // persist in context
      setChartData(aggregateByDate(updated));
      calculateTrend(updated);
      fetchSleepAverage();
    } catch (err) {
      console.error("Failed to delete sleep entry:", err);
    }
  }

  function aggregateByDate(entries) {
    const grouped = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = 0;
      acc[entry.date] += entry.hours;
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeek = entries.filter((s) => new Date(s.date) >= oneWeekAgo);
    const lastWeek = entries.filter(
      (s) => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo
    );

    const avgThisWeek = thisWeek.reduce((sum, s) => sum + s.hours, 0) / (thisWeek.length || 1);
    const avgLastWeek = lastWeek.reduce((sum, s) => sum + s.hours, 0) / (lastWeek.length || 1);

    if (avgThisWeek > avgLastWeek) setTrend("You’re sleeping better this week :)");
    else if (avgThisWeek < avgLastWeek) setTrend("You’re sleeping less than last week :(");
    else setTrend("Your sleep is about the same as last week!");

    setHours(avgThisWeek); // persist in context
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
            onChange={(e) => setGoal(Number(e.target.value))}
            className={styles.input}
            style={{ width: "60px", marginLeft: "0.5rem" }}
          />
          {" "}hrs
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

      {/* Sleep Entries list */}
      <ul className={styles.sleepList}>
        {sleeps.map((s) => (
          <li key={s.id} className={styles.sleepItem}>
            <span>
              <strong>{s.date}</strong> —{" "}
              <span style={{ color: s.hours < 6 ? "red" : "green" }}>{s.hours} hours</span>
            </span>
            <button onClick={() => handleDeleteSleep(s.id)} className={styles.button}>
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

      {/* AI Assistant */}
      <AiAssistant currentPage="sleep" />
    </div>
  );
}
