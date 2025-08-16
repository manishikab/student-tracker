const BASE_URL = "http://127.0.0.1:8000/wellness";

export async function getWellnessEntries() {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
}

export async function postWellnessEntry(wellness) {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wellness),
  });
  return res.json();
}

export async function deleteWellnessEntry(wellness_id) {
  await fetch(`${BASE_URL}/${wellness_id}`, { method: "DELETE" });
}



