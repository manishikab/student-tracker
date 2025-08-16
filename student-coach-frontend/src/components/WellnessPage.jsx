import { useState, useEffect } from "react";
import { getWellnessEntries, postWellnessEntry, deleteWellnessEntry} from "../api/wellnessAPI.js";

export default function WellnessPage() {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");   
  const [date, setDate] = useState("");   
  const [notes, setNotes] = useState(""); 

  // Fetch wellness entries from backend on mount
  useEffect(() => {
    fetchWellnessEntries();
  }, []);

  async function fetchWellnessEntries() {
    const data = await getWellnessEntries();
    setEntries(data);
  }

  async function handleAddEntry() {
    if (!date || !mood || !energy) return;
    const created = await postWellnessEntry({
        date, 
        mood: Number(mood),                            
        energy: Number(energy),
        notes: notes || null
    });

    setEntries([...entries, created]);
    setMood("");
    setEnergy("");
  }

  async function handleDeleteEntry(id) {
    await deleteWellnessEntry(id);
    setEntries(entries.filter((e) => e.id !== id));
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Wellness Tracker</h1>

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
          type="number"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mood"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <input
          type="number"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
          placeholder="Energy Level"
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
        <strong>Date:</strong> {e.date} | <strong>Mood:</strong> {e.mood} | <strong>Energy:</strong> {e.energy}
      </div>
      {e.notes && <div><strong>Notes:</strong> {e.notes}</div>}
      <button onClick={() => handleDeleteEntry(e.id)} style={{ marginTop: "0.5rem" }}>Delete</button>
    </li>
  ))}
</ul>
        
    </div>
  );
}