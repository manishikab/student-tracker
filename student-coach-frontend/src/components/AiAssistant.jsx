import { useContext, useState, useEffect } from "react";
import { DashboardContext } from "../DashboardContext";
import styles from "../AiAssistant.module.css";

export default function AiAssistant({ currentPage }) {
  const { todoTasks, sleepEntries, wellnessEntries, exerciseEntries } = useContext(DashboardContext);
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
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me a short personalized tip for my ${currentPage}.`,
          userId: "default_user",
          page: currentPage,
          context: { todoTasks, sleepEntries, wellnessEntries, exerciseEntries }
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
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: "default_user",
          page: currentPage,
          context: { todoTasks, sleepEntries, wellnessEntries, exerciseEntries }
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

          {/* only show input after tip is loaded */}
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