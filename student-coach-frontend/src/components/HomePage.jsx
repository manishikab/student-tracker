import React, { useState, useContext } from "react";
import ChatBox from "./ChatBox";
import "../HomePage.css";
import { DashboardContext } from "../DashboardContextValue";
import { addGoal as apiAddGoal, updateGoal, deleteGoal as apiDeleteGoal } from "../api/goalsApi";

export default function HomePage() {
  const [goalInput, setGoalInput] = useState("");

  const { incompleteTodoTasks, todayExerciseMinutes, lastNightSleepHours, todayWellness, goals, setGoals } =
    useContext(DashboardContext);


  const addGoal = async () => {
    if (!goalInput.trim()) return;
    try {
      const newGoal = await apiAddGoal({ text: goalInput.trim(), done: false });
      if (newGoal) setGoals((currentGoals) => [newGoal, ...currentGoals]);
      setGoalInput("");
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  };

  const toggleGoal = async (index) => {
    const goal = goals[index];
    try {
      const updated = await updateGoal(goal.id, { ...goal, done: !goal.done });
      if (updated) {
        setGoals((currentGoals) => currentGoals.map((item) => (
          item.id === goal.id ? updated : item
        )));
      }
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await apiDeleteGoal(id);
      setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="container">
      <div className="homepage">
        <h1>Student Life, Simplified.</h1>
        <h2>Your AI-powered hub for school, health, and balance.</h2>

        <div className="cards-container">
          <div className="card">
            ★ <strong>To-Do:</strong><br />
            {incompleteTodoTasks.length ? `${incompleteTodoTasks.length} tasks left` : "None!"}
          </div>
          <div className="card">
            ★ <strong>Exercise:</strong><br />
            {todayExerciseMinutes > 0 ? `${todayExerciseMinutes} min today` : "Log your exercise!"}
          </div>
          <div className="card">
            ★ <strong>Sleep:</strong><br />
            {lastNightSleepHours > 0 ? `${lastNightSleepHours} hrs last night` : "Log your sleep hours!"}
          </div>
          <div className="card">
            ★ <strong>Wellness:</strong><br />
            {todayWellness
              ? `Mood: ${todayWellness.mood}/10, Energy: ${todayWellness.energy}/10`
              : "Log your daily wellness check-in!"}
          </div>
        </div>

        <div className="goal-box">
          <h2>My Goals</h2>
          <div className="goal-input">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Add a new goal..."
              onKeyDown={(e) => {
                if (e.key === "Enter") addGoal();
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
                  className="delete-goal-btn"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-section">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
