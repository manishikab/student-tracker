import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fetch last 10 messages for a user
function getChatHistory(userId, limit = 10) {
  const stmt = db.prepare(
    `SELECT role, content FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT ?`
  );
  const rows = stmt.all(userId, limit);
  return rows.reverse(); // oldest → newest
}

app.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await db.all(
      "SELECT role, content FROM messages WHERE userId = ? ORDER BY id ASC",
      userId
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch history" });
  }
});


// Save a message
function saveMessage(userId, role, content) {
  const stmt = db.prepare(
    `INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)`
  );
  stmt.run(userId, role, content);
}

app.post("/chat", async (req, res) => {
  const { message, userId = "default_user" } = req.body; // later you can pass real user IDs from frontend

  try {
    // Save user message
    saveMessage(userId, "user", message);

    // Get last 10 messages for context
    const history = getChatHistory(userId);

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a friendly wellness coach for a college student.
- Always respond in 1-3 casual sentences.
- Never use numbered lists or long paragraphs.
- Be supportive, like a close friend.
          `,
        },
        ...history,
      ],
      temperature: 0.8,
    });

    const aiReply = response.choices[0].message.content;

    // Save AI reply
    saveMessage(userId, "assistant", aiReply);

    res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
