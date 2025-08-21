const API_URL = import.meta.env.VITE_FASTAPI_URL;

export async function getExerciseEntries() {
  try {
    const res = await fetch(`${API_URL}/exercise`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch exercise entries:", err);
    return [];
  }
}

export async function postExerciseEntry(exercise) {
  try {
    const res = await fetch(`${API_URL}/exercise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exercise),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to post exercise entry:", err);
    return null;
  }
}

export async function deleteExerciseEntry(exercise_id) {
  try {
    await fetch(`${API_URL}/exercise/${exercise_id}`, { method: "DELETE" });
  } catch (err) {
    console.error("Failed to delete exercise entry:", err);
  }
}
