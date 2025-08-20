import React, { createContext, useState, useEffect } from "react";
import { getSleepEntries, getSleepAverage } from "./api/sleepApi";
import { getWellnessEntries } from "./api/wellnessApi";
import { getExerciseEntries } from "./api/exerciseApi";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  // Todos (localStorage)
  const [todoTasks, setTodoTasks] = useState(() => {
    const saved = localStorage.getItem("todoTasks");
    return saved ? JSON.parse(saved) : [];
  });

  // Exercise (backend + localStorage fallback)
  const [exerciseEntries, setExerciseEntries] = useState(() => {
    const saved = localStorage.getItem("exerciseEntries");
    return saved ? JSON.parse(saved) : [];
  });

  // Sleep → backend is source of truth
  const [sleepEntries, setSleepEntries] = useState([]);
  const [sleepHours, setSleepHours] = useState(0);

  // Wellness
  const [wellnessEntries, setWellnessEntries] = useState(() => {
    const saved = localStorage.getItem("wellnessEntries");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch sleep entries + average on mount
  useEffect(() => {
    async function fetchSleep() {
      try {
        const entries = await getSleepEntries();
        setSleepEntries(entries);

        const avg = await getSleepAverage();
        setSleepHours(avg?.average_hours || 0);
      } catch (err) {
        console.error("Failed to fetch sleep data:", err);
      }
    }
    fetchSleep();
  }, []);

  // Fetch wellness & exercise entries from backend on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const wellness = await getWellnessEntries();
        setWellnessEntries(wellness);

        const exercise = await getExerciseEntries();
        setExerciseEntries(exercise);
      } catch (err) {
        console.error("Failed to fetch wellness/exercise:", err);
      }
    }
    fetchData();
  }, []);

  // Persist localStorage for non-sleep data
  useEffect(() => localStorage.setItem("todoTasks", JSON.stringify(todoTasks)), [todoTasks]);
  useEffect(() => localStorage.setItem("exerciseEntries", JSON.stringify(exerciseEntries)), [exerciseEntries]);
  useEffect(() => localStorage.setItem("wellnessEntries", JSON.stringify(wellnessEntries)), [wellnessEntries]);

  // Helper: today snapshots
  const today = new Date().toISOString().split("T")[0];
  const todayExercise = exerciseEntries.find(e => e.date === today) || null;
  const todaySleep = sleepEntries.find(s => s.date === today) || null;
  const todayWellness = wellnessEntries.find(w => w.date === today) || null;

  return (
    <DashboardContext.Provider
      value={{
        todoTasks, setTodoTasks,
        exerciseEntries, setExerciseEntries,
        sleepEntries, setSleepEntries,
        wellnessEntries, setWellnessEntries,
        todayExercise,
        todaySleep,
        todayWellness,
        sleepHours,
        setSleepHours,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};