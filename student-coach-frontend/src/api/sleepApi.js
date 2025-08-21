const API_URL = import.meta.env.VITE_FASTAPI_URL;

export async function getSleepEntries() {
  try {
    const res = await fetch(`${API_URL}/sleep`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch sleep entries:", err);
    return [];
  }
}

export async function getSleepAverage() {
  try {
    const res = await fetch(`${API_URL}/sleep/weekly_average`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch sleep average:", err);
    return 0;
  }
}

export async function postSleepEntry(entry) {
  try {
    const res = await fetch(`${API_URL}/sleep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to post sleep entry:", err);
    return null;
  }
}

export async function deleteSleepEntry(id) {
  try {
    await fetch(`${API_URL}/sleep/${id}`, { method: "DELETE" });
  } catch (err) {
    console.error("Failed to delete sleep entry:", err);
  }
}
