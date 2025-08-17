import React, { useState } from 'react';
import '../ChatBox.css'; // we'll make this next

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input) return;
    setMessages([...messages, { role: 'user', text: input }]);

    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages([...messages, { role: 'user', text: input }, { role: 'ai', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'AI', text: 'Error: could not reach AI' }]);
    }

    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}