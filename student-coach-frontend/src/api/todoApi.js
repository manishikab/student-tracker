const API_URL = import.meta.env.VITE_FASTAPI_URL;

export async function getTodos() {
  try {
    const res = await fetch(`${API_URL}/todos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch todos:", err);
    return [];
  }
}

export async function createTodo(todo) {
  try {
    const res = await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to create todo:", err);
    return null;
  }
}

export async function updateTodo(id, updatedTodo) {
  try {
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to update todo:", err);
    return null;
  }
}

export async function deleteTodo(id) {
  try {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
  } catch (err) {
    console.error("Failed to delete todo:", err);
  }
}
