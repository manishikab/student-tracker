const BASE_URL = import.meta.env.VITE_API_URL + "/wellness";

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



