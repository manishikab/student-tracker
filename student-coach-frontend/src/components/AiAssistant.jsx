import { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../DashboardContext";
import styles from "../AIAssistant.module.css";
import { EXPRESS_URL } from "../config.js";

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
  const [loading, setLoading] = useState(false);

  // Fetch a tip when chat first opens
  useEffect(() => {
    if (open && chat.length === 0) fetchTip();
  }, [open]);

  const fetchTip = async () => {
    setLoading(true);
    setChat([{ role: "assistant", content: "Thinking..." }]);

    const promptMessage = `
      Give a short personalized tip for ${currentPage}.
      Context:
      - todoTasks: ${todoTasks.length}
      - todayExerciseMinutes: ${todayExerciseMinutes}
      - todayWellness: ${todayWellness ? "yes" : "no"}
      - yesterdaySleepHours: ${lastNightSleepHours}
      - sleep entries: ${sleepEntries.length}
      - exercise entries: ${exerciseEntries.length}
      - wellness entries: ${wellnessEntries.length}
      Only suggest exercise if todayExerciseMinutes === 0, and only suggest wellness if todayWellness is null.
    `;

    try {
      const res = await fetch(`${EXPRESS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage,
          userId: "default_user",
          page: currentPage,
          context: { todoTasks, sleepEntries, wellnessEntries, exerciseEntries, todayExerciseMinutes, todayWellness }
        })
      });

      const data = await res.json();
      setChat([{ role: "assistant", content: data.reply || "No response." }]);
    } catch (err) {
      console.error(err);
      setChat([{ role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setChat(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    const promptMessage = `
      User message: ${userMessage}
      Context:
      - todoTasks: ${todoTasks.length}
      - todayExerciseMinutes: ${todayExerciseMinutes}
      - todayWellness: ${todayWellness ? "yes" : "no"}
      - yesterdaySleepHours: ${lastNightSleepHours}
      - sleep entries: ${sleepEntries.length}
      - exercise entries: ${exerciseEntries.length}
      - wellness entries: ${wellnessEntries.length}
    `;

    try {
      const res = await fetch(`${EXPRESS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage,
          userId: "default_user",
          page: currentPage,
          context: { todoTasks, sleepEntries, wellnessEntries, exerciseEntries, todayExerciseMinutes, todayWellness }
        })
      });

      const data = await res.json();
      setChat(prev => [...prev, { role: "assistant", content: data.reply || "No response." }]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

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

          <div className={styles.inputRow}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      )}
      <button className={styles.fab} onClick={() => setOpen(!open)}>
        {open ? "×" : "🤖"}
      </button>
    </div>
  );
}
