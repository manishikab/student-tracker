import React, { useState , useContext } from "react";
import ChatBox from "./ChatBox";
import "../HomePage.css"; // We'll create this for dashboard styles
import { DashboardContext } from "../DashboardContext";

export default function HomePage() {
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");
const { todoTasks, exerciseMinutes, sleepHours, wellnessStatus } = useContext(DashboardContext);


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

      {/* Dashboard Cards */}
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