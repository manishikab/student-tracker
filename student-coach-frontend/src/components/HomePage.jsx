import React, { useState, useContext, useEffect } from "react";
import ChatBox from "./ChatBox";
import "../HomePage.css";
import { DashboardContext } from "../DashboardContext";
import { getGoals, addGoal as apiAddGoal, updateGoal, deleteGoal as apiDeleteGoal } from "../api/goalsApi";

export default function HomePage() {
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");

  // Pull dashboard snapshots from context (no extra fetching here)
  const {
    incompleteTodoTasks,
    todayExerciseMinutes,     // number (total minutes today)
    lastNightSleepHours,      // number (hours last night)
    todayWellness,            // object or null ({mood, energy, ...})
  } = useContext(DashboardContext);

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
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="container">
      <div className="homepage">
        <h1>
          Student Life, Simplified.
        </h1>
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
  ★ <strong>To-Do:</strong>
  <br />
  {incompleteTodoTasks.length > 0
    ? `${incompleteTodoTasks.length} tasks left`
    : "None!"}
</div>

          {/* Exercise */}
          <div className="card">
            ★ <strong>Exercise:</strong>
            <br />
            {todayExerciseMinutes > 0
              ? `${todayExerciseMinutes} min today`
              : "Log your exercise!"}
          </div>

          {/* Sleep */}
          <div className="card">
            ★ <strong>Sleep:</strong>
            <br />
            {lastNightSleepHours > 0
              ? `${lastNightSleepHours} hrs last night`
              : "Log your sleep hours!"}
          </div>

          {/* Wellness */}
          {/* Wellness */}
<div className="card">
  ★ <strong>Wellness:</strong><br />
  {todayWellness
    ? `Mood: ${todayWellness.mood}/10, Energy: ${todayWellness.energy}/10`
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
                  e.preventDefault();
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
                    cursor: "pointer",
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
