import { useContext, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { DashboardContext } from "../DashboardContext";
import "../CalendarPage.css";

export default function CalendarPage() {
  const { sleepEntries, exerciseEntries, wellnessEntries } = useContext(DashboardContext);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Parse a YYYY-MM-DD string as a local Date
  function parseLocalDate(d) {
    if (d instanceof Date) return d;
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Format date in local YYYY-MM-DD
  function formatDate(d) {
    const dateObj = parseLocalDate(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Normalize all entries
  const markedDates = new Set([
    ...sleepEntries.map((e) => formatDate(e.date)),
    ...exerciseEntries.map((e) => formatDate(e.date)),
    ...wellnessEntries.map((e) => formatDate(e.date)),
  ]);

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

  return (
    <div className="calendar-page">
      <header>Activity Calendar</header>

      <div className="calendar-container">
        {/* LEFT: Calendar + daily summary */}
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
              {dailyLogs.sleep.map((s, i) => <p key={i}>💤 Slept {s.hours} hrs</p>)}
              {dailyLogs.exercise.map((x, i) => <p key={i}>💪 {x.duration} mins exercise</p>)}
              {dailyLogs.wellness.map((w, i) => <p key={i}>🌱 Mood {w.mood}/10, Energy {w.energy}/10</p>)}
              {dailyLogs.sleep.length + dailyLogs.exercise.length + dailyLogs.wellness.length === 0 && <p>No logs for this day.</p>}
            </div>
          )}
        </div>

        {/* RIGHT: Legend + Button */}
        <div className="calendar-right">
          <div className="calendar-legend-wrapper">
            <div className="legend-item"><span className="dot sleep"></span> Sleep</div>
            <div className="legend-item"><span className="dot exercise"></span> Exercise</div>
            <div className="legend-item"><span className="dot wellness"></span> Wellness</div>
          </div>
          <div className="jump-today-wrapper">
            <button className="button" onClick={jumpToToday}>Jump to Today</button>
          </div>
        </div>
      </div>
    </div>
  );
}
