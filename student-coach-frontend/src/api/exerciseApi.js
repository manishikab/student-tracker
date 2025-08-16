const BASE_URL = "http://127.0.0.1:8000/exercise";

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

