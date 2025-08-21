import React, { createContext, useState, useEffect } from "react";
import { getTodos } from "./api/todoApi";
import { getExerciseEntries } from "./api/exerciseApi";
import { getSleepEntries } from "./api/sleepApi";
import { getWellnessEntries } from "./api/wellnessAPI";

// helper: normalize JS Date → YYYY-MM-DD in local time
const toLocalDate = (d) => {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().split("T")[0];
};

export const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [todoTasks, setTodoTasks] = useState([]);
  const [exerciseEntries, setExerciseEntries] = useState([]);
  const [sleepEntries, setSleepEntries] = useState([]);
  const [wellnessEntries, setWellnessEntries] = useState([]);

  const [wellnessStatus, setWellnessStatus] = useState(0);

  // fetch on mount
  useEffect(() => {
  async function fetchAll() {
    try {
      const todos = await getTodos();
      setTodoTasks(todos);

      const exercise = await getExerciseEntries();
      setExerciseEntries(exercise);

      const sleep = await getSleepEntries();
      setSleepEntries(sleep);

      const wellness = await getWellnessEntries();
      setWellnessEntries(wellness);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  }
  fetchAll();
}, []);

  // derived snapshots
  const today = toLocalDate(new Date());
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDate(d);
  })();

  // exercise minutes today
  const todayExerciseMinutes = exerciseEntries
  .filter((e) => e.date === today)
  .reduce((sum, e) => sum + (e.duration || 0), 0);
  const todayExercise = exerciseEntries.filter((e) => e.date === today);

  // sleep hours last night
  const lastNightSleep = sleepEntries.find((s) => s.date === yesterday) || null;
  const lastNightSleepHours = lastNightSleep ? lastNightSleep.hours : 0;

  // wellness entry today
  const todayWellness = wellnessEntries.find((w) => w.date === today) || null;

  const incompleteTodoTasks = todoTasks.filter(task => !task.completed);

  return (
    <DashboardContext.Provider
      value={{
        // raw
        todoTasks,
        setTodoTasks,
        exerciseEntries,
        setExerciseEntries,
        sleepEntries,
        setSleepEntries,
        wellnessEntries,
        setWellnessEntries,

        // derived
        incompleteTodoTasks,
        todayExerciseMinutes,
        lastNightSleepHours,
        todayWellness,
        todayExercise,

        wellnessStatus,
        setWellnessStatus,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}