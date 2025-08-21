const API_URL = import.meta.env.VITE_FASTAPI_URL;

export async function getWellnessEntries() {
  try {
    const res = await fetch(`${API_URL}/wellness`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch wellness entries:", err);
    return [];
  }
}

export async function postWellnessEntry(wellness) {
  try {
    const res = await fetch(`${API_URL}/wellness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wellness),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to post wellness entry:", err);
    return null;
  }
}

export async function deleteWellnessEntry(wellness_id) {
  try {
    await fetch(`${API_URL}/wellness/${wellness_id}`, { method: "DELETE" });
  } catch (err) {
    console.error("Failed to delete wellness entry:", err);
  }
}
