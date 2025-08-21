import axios from "axios";

const API_URL = import.meta.env.VITE_FASTAPI_URL;

export async function getGoals() {
  try {
    const res = await axios.get(`${API_URL}/goals`);
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch goals:", err);
    return [];
  }
}

export async function addGoal(goal) {
  try {
    const res = await axios.post(`${API_URL}/goals`, goal);
    return res.data;
  } catch (err) {
    console.error("Failed to add goal:", err);
    return null;
  }
}

export async function updateGoal(id, goal) {
  try {
    const res = await axios.put(`${API_URL}/goals/${id}`, goal);
    return res.data;
  } catch (err) {
    console.error("Failed to update goal:", err);
    return null;
  }
}

export async function deleteGoal(id) {
  try {
    await axios.delete(`${API_URL}/goals/${id}`);
  } catch (err) {
    console.error("Failed to delete goal:", err);
  }
}
