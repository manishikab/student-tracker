import React, { useState , useContext, useEffect } from "react";
import ChatBox from "./ChatBox";
import "../HomePage.css";
import { DashboardContext } from "../DashboardContext";
import { getTodos } from "../api/todoApi";
import { getExerciseEntries } from "../api/exerciseApi";
import { getWellnessEntries } from "../api/wellnessAPI";
import { getSleepEntries } from "../api/sleepApi";
import { getGoals, addGoal as apiAddGoal, updateGoal, deleteGoal as apiDeleteGoal } from "../api/goalsApi";

export default function HomePage() {
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");
  const { todoTasks, setTodoTasks, exerciseMinutes, setExerciseMinutes, sleepHours, setSleepHours, wellnessStatus, setWellnessStatus } = useContext(DashboardContext);

  // Load goals from API
  useEffect(() => {
    async function fetchGoals() {
      try {
        const data = await getGoals();
        setGoals(data);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      }
    }
    fetchGoals();
  }, []);

  // Fetch everything else on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Todos
        const todos = await getTodos();
        setTodoTasks(todos);

        // Exercise
        const exercises = await getExerciseEntries();
        const today = new Date().toISOString().split("T")[0];
        const todayExercises = exercises.filter(e => e.date === today);
        const totalMinutes = todayExercises.reduce((sum, e) => sum + (e.duration || 0), 0);
        setExerciseMinutes(totalMinutes);

        // Sleep
        const sleeps = await getSleepEntries();
        const lastNight = sleeps.length > 0 ? sleeps[sleeps.length - 1].hours : 0;
        setSleepHours(lastNight);

        // Wellness
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

  // Add goal
  const addGoal = async () => {
    if (goalInput.trim() === "") return;
    try {
      const newGoal = await apiAddGoal({ text: goalInput, done: false });
      setGoals([newGoal, ...goals]);
      setGoalInput("");
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  };

  // Toggle goal
  const toggleGoal = async (index) => {
    const goal = goals[index];
    try {
      const updated = await updateGoal(goal.id, { ...goal, done: !goal.done });
      const newGoals = [...goals];
      newGoals[index] = updated;
      setGoals(newGoals);
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  };

  // Delete goal
  const deleteGoal = async (id) => {
    try {
      await apiDeleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="container">
      <div className="homepage">
        <h1>Welcome to Your <br /> 
        Student Life Dashboard!</h1>
      <h2>Your AI-powered hub for school, health, and balance.</h2>

     <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    margin: "2rem 0",
  }}
>
  {/* To-Do */}
  <div className="card">
    ★ <strong>To-Do:</strong><br />
    {todoTasks.length > 0
      ? `${todoTasks.length} tasks left`
      : "None!"}
  </div>

  {/* Exercise */}
  <div className="card">
    ★ <strong>Exercise:</strong><br />
    {exerciseMinutes > 0
      ? `${exerciseMinutes} min today`
      : "Log your exercise!"}
  </div>

  {/* Sleep */}
  <div className="card">
    ★ <strong>Sleep:</strong><br />
    {sleepHours > 0
      ? `${sleepHours} hrs last night`
      : "Log your sleep hours!"}
  </div>

  {/* Wellness */}
  <div className="card">
    ★ <strong>Wellness:</strong><br />
    {wellnessStatus && wellnessStatus.trim() !== ""
      ? wellnessStatus
      : "Log your daily wellness check-in!"}
  </div>
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
              onKeyDown={(e) => {
        if (e.key === "Enter" && goalInput.trim()) {
          addGoal();
          e.preventDefault(); // prevents form submission or extra newlines
        }
      }}
          />
          <button onClick={addGoal}>Add</button>
        </div>
        <ul>
          {goals.map((goal, i) => (
            <li key={goal.id} className={goal.done ? "done" : ""}>
              <span onClick={() => toggleGoal(i)}>{goal.text}</span>
              <button 
                onClick={() => deleteGoal(goal.id)} 
                style={{
                  marginLeft: "10px",
                  background: "transparent",
                  border: "none",
                  color: "#BB6653",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Chat */}
      <div className="chat-section">
        <ChatBox />
      </div>
      </div>
    </div>
  );
}