import { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../DashboardContext";
import styles from "../AiAssistant.module.css";

export default function AiAssistant({ currentPage }) {
  const { 
    todoTasks, 
    sleepEntries, 
    wellnessEntries, 
    exerciseEntries,
    todayExerciseMinutes,
    todayWellness,
    lastNightSleepHours
  } = useContext(DashboardContext);

  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);

  // fetch tip when chat opens
  useEffect(() => {
    if (open && chat.length === 0) {
      setLoadingTip(true);
      setChat([{ role: "assistant", content: "Thinking..." }]);
      fetchTip();
    }
  }, [open]);

  async function fetchTip() {
    try {
      const promptMessage = `
Give me a short personalized tip for my ${currentPage}.
Use the context below to make it accurate:
- todoTasks count: ${todoTasks.length}
- todayExerciseMinutes: ${todayExerciseMinutes}
- todayWellness logged: ${todayWellness ? "yes" : "no"}
- yesterdaySleepHours: ${lastNightSleepHours}  // <--- new line
- sleep entries: ${sleepEntries.length} entries
- exercise entries: ${exerciseEntries.length} entries
- wellness entries: ${wellnessEntries.length} entries
Only suggest exercise if todayExerciseMinutes === 0, and only suggest wellness if todayWellness is null.
`;

      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage,
          userId: "default_user",
          page: currentPage,
          context: { 
            todoTasks, 
            sleepEntries, 
            wellnessEntries, 
            exerciseEntries,
            todayExerciseMinutes,
            todayWellness
          }
        })
      });

      const data = await res.json();

      setChat([{ role: "assistant", content: data.reply }]);
      setLoadingTip(false);
    } catch (err) {
      console.error(err);
      setChat([{ role: "assistant", content: "Sorry, something went wrong." }]);
      setLoadingTip(false);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;

    setChat([...chat, { role: "user", content: input }]);
    setInput("");

    try {
      const promptMessage = `
User message: ${input}
Context:
- todayExerciseMinutes: ${todayExerciseMinutes}
- todayWellness logged: ${todayWellness ? "yes" : "no"}
- todoTasks count: ${todoTasks.length}
- sleep entries: ${sleepEntries.length} entries
- exercise entries: ${exerciseEntries.length} entries
- wellness entries: ${wellnessEntries.length} entries
`;

      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage,
          userId: "default_user",
          page: currentPage,
          context: { 
            todoTasks, 
            sleepEntries, 
            wellnessEntries, 
            exerciseEntries,
            todayExerciseMinutes,
            todayWellness
          }
        })
      });

      const data = await res.json();
      setChat(c => [...c, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChat(c => [...c, { role: "assistant", content: "Sorry, something went wrong." }]);
    }
  }

  return (
    <div className={styles.assistantWrapper}>
      {open && (
        <div className={styles.chatBox}>
          <h4>AI Assistant</h4>
          <div className={styles.messages}>
            {chat.map((m, i) => (
              <p key={i} className={m.role === "user" ? styles.userMsg : styles.botMsg}>
                {m.content}
              </p>
            ))}
          </div>

          {!loadingTip && (
            <div className={styles.inputRow}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          )}
        </div>
      )}
      <button
        className={styles.fab}
        onClick={() => setOpen(!open)}
      >
        {open ? "×" : "🤖"}
      </button>
    </div>
  );
}
