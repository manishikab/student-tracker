import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js"; // only once

import { getTodos } from "./api/todoApi";
import { getExerciseEntries } from "./api/exerciseApi";
import { getSleepEntries } from "./api/sleepApi";
import { getWellnessEntries } from "./api/wellnessAPI";

// Helper: normalize JS Date → YYYY-MM-DD in local time
const toLocalDate = (d) => {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().split("T")[0];
};

export const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // track if auth is ready

  // Dashboard state
  const [todoTasks, setTodoTasks] = useState([]);
  const [exerciseEntries, setExerciseEntries] = useState([]);
  const [sleepEntries, setSleepEntries] = useState([]);
  const [wellnessEntries, setWellnessEntries] = useState([]);
  const [wellnessStatus, setWellnessStatus] = useState(0);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoadingAuth(false); // auth state resolved
    });

    return () => unsubscribe();
  }, []);

  // Helper: fetch API with auth token
  const authFetch = async (url, options = {}) => {
    if (!token) throw new Error("No token available for authFetch");

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
  };

  // Fetch dashboard data once token is ready
  useEffect(() => {
    if (!token) return; // wait until token is set
    if (!user) return; // ensure user exists

    async function fetchAll() {
      try {
        setTodoTasks(await getTodos(authFetch));
        setExerciseEntries(await getExerciseEntries(authFetch));
        setSleepEntries(await getSleepEntries(authFetch));
        setWellnessEntries(await getWellnessEntries(authFetch));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    }

    fetchAll();
  }, [token, user]);

  // Derived snapshots
  const today = toLocalDate(new Date());
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDate(d);
  })();

  const todayExerciseMinutes = exerciseEntries
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + (e.duration || 0), 0);
  const todayExercise = exerciseEntries.filter((e) => e.date === today);

  const lastNightSleep = sleepEntries.find((s) => s.date === yesterday) || null;
  const lastNightSleepHours = lastNightSleep ? lastNightSleep.hours : 0;

  const todayWellness = wellnessEntries.find((w) => w.date === today) || null;
  const incompleteTodoTasks = todoTasks.filter((task) => !task.completed);

  return (
    <DashboardContext.Provider
      value={{
        user,
        token,
        setToken,       // <-- expose setter
        loadingAuth,
        authFetch,
  
        // raw data
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
