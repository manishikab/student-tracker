import { useState, useEffect } from "react";
import { getSleepEntries, postSleepEntry, getSleepAverage, deleteSleepEntry} from "../api/sleepApi.js";

export default function SleepPage() {
  const [sleeps, setSleeps] = useState([]);
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [average, setAverage] = useState(null);

  // Fetch sleep entries from backend on mount
  useEffect(() => {
    fetchSleepEntries();
    fetchSleepAverage();
  }, []);

  async function fetchSleepEntries() {
    const data = await getSleepEntries();
    setSleeps(data);
  }

  async function fetchSleepAverage(){
    const avg = await getSleepAverage();
    setAverage(avg);
  }

  async function handleAddSleep() {
    if (!hours || !date) return;
    const created = await postSleepEntry({hours: Number(hours), date});
    setSleeps([...sleeps, created]);
    setHours("");
    setDate("");
    fetchSleepAverage();
  }

  async function handleDeleteSleep(id) {
    await deleteSleepEntry(id);
    setSleeps(sleeps.filter((s) => s.id !== id));
    fetchSleepAverage(); 
  }


  

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Sleep Tracker</h1>

      {/*ADD */}
      <div>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours slept"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Date"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button onClick={handleAddSleep} style={{ padding: "0.5rem"}}>
          Add
        </button>
      </div>


      {/* Sleep Entries list */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sleeps.map((s) => (
          <li key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span>
              <strong>{s.date}</strong> — {s.hours} hours
            </span>
            <button onClick={() => handleDeleteSleep(s.id)} style={{ marginLeft: "0.5rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>


            {/* Show weekly average */}
      {average && (
        <div style={{fontWeight: "bold" }}>
          Weekly Average: {average.average_hours} hrs
        </div>
      )}

        
    </div>
  );
}