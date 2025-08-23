import { useContext, useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { DashboardContext } from "../DashboardContext";
import "../CalendarPage.css";

const API_URL = import.meta.env.VITE_FASTAPI_URL;

export default function CalendarPage() {
  const { sleepEntries: contextSleep, exerciseEntries: contextExercise, wellnessEntries: contextWellness } =
    useContext(DashboardContext);

  const [sleepEntries, setSleepEntries] = useState([]);
  const [exerciseEntries, setExerciseEntries] = useState([]);
  const [wellnessEntries, setWellnessEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Initial fetch from FastAPI (only runs once on mount)
  useEffect(() => {
    async function fetchEntries() {
      try {
        const [sleepRes, exerciseRes, wellnessRes] = await Promise.all([
          fetch(`${API_URL}/sleep/`).then((r) => r.json()),
          fetch(`${API_URL}/exercise/`).then((r) => r.json()),
          fetch(`${API_URL}/wellness/`).then((r) => r.json()),
        ]);

        setSleepEntries(sleepRes || []);
        setExerciseEntries(exerciseRes || []);
        setWellnessEntries(wellnessRes || []);
      } catch (err) {
        console.error("Failed to fetch entries:", err);
      } finally {
        setLoading(false); // only once
      }
    }

    fetchEntries();
  }, []);

  // Sync entries whenever DashboardContext updates (no loading flash)
  useEffect(() => {
    if (contextSleep) setSleepEntries(contextSleep);
    if (contextExercise) setExerciseEntries(contextExercise);
    if (contextWellness) setWellnessEntries(contextWellness);
  }, [contextSleep, contextExercise, contextWellness]);

  function parseLocalDate(d) {
    if (d instanceof Date) return d;
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(d) {
    const dateObj = parseLocalDate(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function tileContent({ date, view }) {
    if (view !== "month") return null;
    const day = formatDate(date);

    const hasSleep = sleepEntries.some((e) => formatDate(e.date) === day);
    const hasExercise = exerciseEntries.some((e) => formatDate(e.date) === day);
    const hasWellness = wellnessEntries.some((e) => formatDate(e.date) === day);

    return (
      <div className="dots">
        {hasSleep && <span className="dot sleep"></span>}
        {hasExercise && <span className="dot exercise"></span>}
        {hasWellness && <span className="dot wellness"></span>}
      </div>
    );
  }

  const dailyLogs = selectedDate
    ? {
        sleep: sleepEntries.filter((e) => formatDate(e.date) === formatDate(selectedDate)),
        exercise: exerciseEntries.filter((e) => formatDate(e.date) === formatDate(selectedDate)),
        wellness: wellnessEntries.filter((e) => formatDate(e.date) === formatDate(selectedDate)),
      }
    : { sleep: [], exercise: [], wellness: [] };

  function jumpToToday() {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  }

  // Show styled loading screen only during first load
  if (loading) {
    return (
      <div className="calendar-page">
        <header>Activity Calendar</header>
        <div className="calendar-container">
          <div className="loading-placeholder">
            <div className="spinner"></div>
            <p>Loading your calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <header>Activity Calendar</header>

      <div className="calendar-container">
        <div className="calendar-left">
          <Calendar
            onClickDay={(date) => setSelectedDate(date)}
            value={selectedDate}
            activeStartDate={currentMonth}
            onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
            tileContent={tileContent}
            calendarType="hebrew"
          />

          {selectedDate && (
            <div className="day-summary">
              <h3>Entries for {formatDate(selectedDate)}</h3>
              {dailyLogs.sleep.map((s, i) => (
                <p key={i}>💤 Slept {s.hours} hrs</p>
              ))}
              {dailyLogs.exercise.map((x, i) => (
                <p key={i}>💪 {x.duration} mins exercise</p>
              ))}
              {dailyLogs.wellness.map((w, i) => (
                <p key={i}>🌱 Mood {w.mood}/10, Energy {w.energy}/10</p>
              ))}
              {dailyLogs.sleep.length +
                dailyLogs.exercise.length +
                dailyLogs.wellness.length ===
                0 && <p>No logs for this day.</p>}
            </div>
          )}
        </div>

        <div className="calendar-right">
          <div className="calendar-legend-wrapper">
            <div className="legend-item">
              <span className="dot sleep"></span> Sleep
            </div>
            <div className="legend-item">
              <span className="dot exercise"></span> Exercise
            </div>
            <div className="legend-item">
              <span className="dot wellness"></span> Wellness
            </div>
          </div>
          <div className="jump-today-wrapper">
            <button className="button" onClick={jumpToToday}>
              Jump to Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
