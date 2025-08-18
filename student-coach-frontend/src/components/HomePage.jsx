import React, { useState , useContext, useEffect } from "react";
import ChatBox from "./ChatBox";
import "../HomePage.css";
import { DashboardContext } from "../DashboardContext";
import { getTodos } from "../api/todoApi";
import { getExerciseEntries } from "../api/exerciseApi";
import { getWellnessEntries } from "../api/wellnessAPI";
import { getSleepEntries } from "../api/sleepApi";
 

export default function HomePage() {
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");
  const { todoTasks, setTodoTasks, exerciseMinutes, setExerciseMinutes, sleepHours, setSleepHours, wellnessStatus, setWellnessStatus } = useContext(DashboardContext);

 // Fetch everything on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // 📝 Todos
        const todos = await getTodos();
        setTodoTasks(todos);

        // 🏃 Exercise → assume API returns an array of entries with minutes
        const exercises = await getExerciseEntries();

        // today's date string
        const today = new Date().toISOString().split("T")[0];

        // filter entries for today
        const todayExercises = exercises.filter(e => e.date === today);

        // sum today's durations
        const totalMinutes = todayExercises.reduce((sum, e) => sum + (e.duration || 0), 0);

        setExerciseMinutes(totalMinutes);

        // 😴 Sleep → assume API returns an array of entries with hours
        const sleeps = await getSleepEntries();
        const lastNight = sleeps.length > 0 ? sleeps[sleeps.length - 1].hours : 0;
        setSleepHours(lastNight);

        // 💛 Wellness → assume API returns an array of moods/status entries
        const wellness = await getWellnessEntries();
        const latestEntry = wellness.length > 0 ? wellness[0] : null;
        const latestStatus = latestEntry ? `Mood: ${latestEntry.mood}/10, Energy: ${latestEntry.energy}/10` : "";
        setWellnessStatus(latestStatus);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    }

    fetchData();
  }, [setTodoTasks, setExerciseMinutes, setSleepHours, setWellnessStatus]);

  const addGoal = () => {
  if (goalInput.trim() === "") return;
  setGoals([...goals, { text: goalInput, done: false }]);
  setGoalInput("");
};

const toggleGoal = (index) => {
  const newGoals = [...goals];
  newGoals[index].done = !newGoals[index].done;
  setGoals(newGoals);
};

  return (
    <div className="homepage">
      <h1>Welcome to Your Student Coach App!</h1>
      <p>Use the navigation to track your life.</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "2rem 0" }}>
        <div className="card">📝 To-Do: {todoTasks.length} tasks left</div>
        <div className="card">🏃 Exercise: {exerciseMinutes} min today</div>
        <div className="card">😴 Sleep: {sleepHours} hrs last night</div>
        <div className="card">💛 Wellness: {wellnessStatus}</div>
      </div>

       {/* Goal Box */}
      <div className="goal-box">
        <h2>My Goals</h2>
        <div className="goal-input">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Add a new goal..."
          />
          <button onClick={addGoal}>Add</button>
        </div>
        <ul>
          {goals.map((goal, i) => (
            <li
              key={i}
              onClick={() => toggleGoal(i)}
              className={goal.done ? "done" : ""}
            >
              {goal.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Tiny Mascot */}
      <div className="mascot">
        🐰 Hello! Keep going—you’re doing great!
      </div>

      {/* AI Chat */}
      <div className="chat-section">
        <ChatBox />
      </div>
    </div>
  );
}