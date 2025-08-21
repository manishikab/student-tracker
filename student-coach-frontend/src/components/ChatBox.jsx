import React, { useState, useContext } from 'react';
import { DashboardContext } from '../DashboardContext';
import '../ChatBox.css';
import { EXPRESS_URL } from '../config.js';

export default function ChatBox({ currentPage }) {
  const {
    todoTasks,
    sleepEntries,
    wellnessEntries,
    exerciseEntries,
    todayExerciseMinutes,
    todayWellness,
    lastNightSleepHours,
  } = useContext(DashboardContext);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    const promptMessage = `
      User message: ${userMessage}
      Context:
      - todoTasks count: ${todoTasks.length}
      - todayExerciseMinutes: ${todayExerciseMinutes}
      - todayWellness logged: ${todayWellness ? 'yes' : 'no'}
      - yesterdaySleepHours: ${lastNightSleepHours}
      - sleep entries: ${sleepEntries.length} entries
      - exercise entries: ${exerciseEntries.length} entries
      - wellness entries: ${wellnessEntries.length} entries
      Only suggest exercise if todayExerciseMinutes === 0, and only suggest wellness if todayWellness is null.
    `;

    try {
      const res = await fetch(`${EXPRESS_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptMessage,
          userId: 'default_user',
          page: currentPage,
          context: { todoTasks, sleepEntries, wellnessEntries, exerciseEntries, todayExerciseMinutes, todayWellness }
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'No response.' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: could not reach AI' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        <h3>Chat with your AI Wellness Coach!</h3>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendMessage();
              e.preventDefault();
            }
          }}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
