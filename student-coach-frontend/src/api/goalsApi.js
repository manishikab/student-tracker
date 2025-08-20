import axios from "axios";

const API_URL = "http://localhost:8000/goals/";

export async function getGoals() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function addGoal(goal) {
  const res = await axios.post(API_URL, goal);
  return res.data;
}

export async function updateGoal(id, goal) {
  const res = await axios.put(`${API_URL}/${id}`, goal);
  return res.data;
}

export async function deleteGoal(id) {
  await axios.delete(`${API_URL}/${id}`);
}