import React, { createContext, useState } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [todoTasks, setTodoTasks] = useState([]);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [wellnessStatus, setWellnessStatus] = useState("");

  return (
    <DashboardContext.Provider value={{
      todoTasks, setTodoTasks,
      exerciseMinutes, setExerciseMinutes,
      sleepHours, setSleepHours,
      wellnessStatus, setWellnessStatus
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
