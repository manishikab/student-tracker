const BASE_URL = import.meta.env.VITE_API_URL + "/sleep";

export async function getSleepEntries() {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
}

export async function getSleepAverage() {
  const res = await fetch(`${BASE_URL}/weekly_average`);
  return res.json();
}

export async function postSleepEntry(entry) {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Server error: ${res.status} - ${err}`);
  }

  try {
    return await res.json(); 
  } catch {
    return { success: true };
  }
}

export async function deleteSleepEntry(id) {
  await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
}

