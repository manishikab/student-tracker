const BASE_URL = import.meta.env.VITE_API_URL + "/exercise"; // reads from .env

export async function getExerciseEntries() {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
}

export async function postExerciseEntry(exercise) {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exercise),
  });
  return res.json();
}

export async function deleteExerciseEntry(exercise_id) {
  await fetch(`${BASE_URL}/${exercise_id}`, { method: "DELETE" });
}

