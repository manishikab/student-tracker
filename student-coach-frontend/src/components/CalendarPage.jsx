import { useContext, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { DashboardContext } from "../DashboardContext";
import "../CalendarPage.css";

export default function CalendarPage() {
  const { sleepEntries, exerciseEntries, wellnessEntries } = useContext(DashboardContext);
  const [selectedDate, setSelectedDate] = useState(null);

  function formatDate(d) {
  if (typeof d === "string") return d; // already normalized
  return new Date(d).toISOString().split("T")[0];
}

// Normalize all entries
const markedDates = new Set([
  ...sleepEntries.map(e => formatDate(e.date)),
  ...exerciseEntries.map(e => formatDate(e.date)),
  ...wellnessEntries.map(e => formatDate(e.date))
]);

function tileContent({ date, view }) {
  if (view !== "month") return null;

  const day = formatDate(date);

  const hasSleep = sleepEntries.some(e => formatDate(e.date) === day);
  const hasExercise = exerciseEntries.some(e => formatDate(e.date) === day);
  const hasWellness = wellnessEntries.some(e => formatDate(e.date) === day);

  return (
    <div className="dots">
      {hasSleep && <span className="dot sleep"></span>}
      {hasExercise && <span className="dot exercise"></span>}
      {hasWellness && <span className="dot wellness"></span>}
    </div>
  );
}

// Daily logs
const dailyLogs = {
  sleep: sleepEntries.filter(e => formatDate(e.date) === selectedDate),
  exercise: exerciseEntries.filter(e => formatDate(e.date) === selectedDate),
  wellness: wellnessEntries.filter(e => formatDate(e.date) === selectedDate)
};

return (
  <div className="calendar-container">
    <h2>Activity Calendar</h2>
    <Calendar
      onClickDay={(date) => setSelectedDate(formatDate(date))}
      tileContent={tileContent}
    />

    {selectedDate && (
      <div className="day-summary">
        <h3>Entries for {selectedDate}</h3>
        {dailyLogs.sleep.map((s, i) => <p key={i}>💤 Slept {s.hours} hrs</p>)}
        {dailyLogs.exercise.map((x, i) => <p key={i}>💪 {x.minutes} mins exercise</p>)}
        {dailyLogs.wellness.map((w, i) => <p key={i}>🌱 {w.note || "Wellness check-in"}</p>)}
        {dailyLogs.sleep.length + dailyLogs.exercise.length + dailyLogs.wellness.length === 0 && (
          <p>No logs for this day.</p>
        )}
      </div>
    )}
  </div>
);
}