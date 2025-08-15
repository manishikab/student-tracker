const BASE_URL = "http://127.0.0.1:8000/todos";

export async function getTodos() {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
}

export async function createTodo(todo) {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return res.json();
}

export async function updateTodo(id, updatedTodo) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTodo),
  });
  return res.json();
}

export async function deleteTodo(id) {
  await fetch(`${BASE_URL}/${id}`, {
     method: "DELETE" 
    });
}