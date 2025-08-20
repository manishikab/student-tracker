import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL + "/goals";
export async function getGoals() {
  const res = await axios.get(BASE_URL);
  return res.data;
}

export async function addGoal(goal) {
  const res = await axios.post(BASE_URL, goal);
  return res.data;
}

export async function updateGoal(id, goal) {
  const res = await axios.put(`${BASE_URL}/${id}`, goal);
  return res.data;
}

export async function deleteGoal(id) {
  await axios.delete(`${BASE_URL}/${id}`);
}