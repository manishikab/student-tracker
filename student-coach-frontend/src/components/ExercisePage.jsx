import { useState, useEffect } from "react";
import { getExerciseEntries, postExerciseEntry, deleteExerciseEntry} from "../api/exerciseApi.js";

export default function ExercisePage() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");   
  const [notes, setNotes] = useState(""); 

  // Fetch wellness entries from backend on mount
  useEffect(() => {
    fetchExerciseEntries();
  }, []);

  async function fetchExerciseEntries() {
    const data = await getExerciseEntries();
    setEntries(data);
  }

  async function handleAddEntry() {
    if (!date || !title) return;
    const created = await postExerciseEntry({
        date, 
        title: title,                       
        notes: notes || null
    });

    setEntries([...entries, created]);
    setDate("");
    setTitle("");
    setNotes("");
  }

  async function handleDeleteEntry(id) {
    await deleteExerciseEntry(id);
    setEntries(entries.filter((e) => e.id !== id));
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Exercise Tracker</h1>

      {/*ADD */}
      <div>
       <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Date"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            style={{ padding: "0.5rem", width: "70%" }}
        />


        <button onClick={handleAddEntry} style={{ padding: "0.5rem"}}>
          Add
        </button>
      </div>


      {/* Wellness Entries list */}
      <ul style={{ listStyle: "none", padding: 0 }}>
  {entries.map((e) => (
    <li key={e.id} style={{ marginBottom: "0.5rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>
      <div>
  <strong>Date:</strong> {e.date} | <strong>Title:</strong> {e.title}
</div>
{e.notes && <div><strong>Notes:</strong> {e.notes}</div>}
      <button onClick={() => handleDeleteEntry(e.id)} style={{ marginTop: "0.5rem" }}>Delete</button>
    </li>
  ))}
</ul>
        
    </div>
  );
}