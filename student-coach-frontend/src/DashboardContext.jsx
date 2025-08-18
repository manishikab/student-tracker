import React, { createContext, useState, useEffect } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  // Load from localStorage (or default to empty values)
  const [todoTasks, setTodoTasks] = useState(() => {
    const saved = localStorage.getItem("todoTasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [exerciseMinutes, setExerciseMinutes] = useState(() => {
    const saved = localStorage.getItem("exerciseMinutes");
    return saved ? JSON.parse(saved) : 0;
  });

  const [sleepHours, setSleepHours] = useState(() => {
    const saved = localStorage.getItem("sleepHours");
    return saved ? JSON.parse(saved) : 0;
  });

  const [wellnessStatus, setWellnessStatus] = useState(() => {
    return localStorage.getItem("wellnessStatus") || "";
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
  }, [todoTasks]);

  useEffect(() => {
    localStorage.setItem("exerciseMinutes", JSON.stringify(exerciseMinutes));
  }, [exerciseMinutes]);

  useEffect(() => {
    localStorage.setItem("sleepHours", JSON.stringify(sleepHours));
  }, [sleepHours]);

  useEffect(() => {
    localStorage.setItem("wellnessStatus", wellnessStatus);
  }, [wellnessStatus]);

  return (
    <DashboardContext.Provider
      value={{
        todoTasks, setTodoTasks,
        exerciseMinutes, setExerciseMinutes,
        sleepHours, setSleepHours,
        wellnessStatus, setWellnessStatus
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};