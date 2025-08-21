import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();
const app = express();
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "student-coach-express" });
});

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

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
  const { message, userId = "default_user", context = {}, page } = req.body;

  try {
    // Save user message
    saveMessage(userId, "user", message);

    // Get last 10 messages for context
    const history = getChatHistory(userId);

    // Format context summary for the AI
    const contextSummary = `
      User dashboard snapshot:
      - Current page: ${page}
      - Todos: ${context.todoTasks?.length || 0} tasks (${context.todoTasks?.slice(0,3).map(t => t.title).join(", ") || "none"})
      - Sleep entries: ${context.sleepEntries?.length || 0} (latest: ${context.sleepEntries?.[0]?.hours || "N/A"} hrs)
      - Exercise entries: ${context.exerciseEntries?.length || 0} (latest: ${context.exerciseEntries?.[0]?.minutes || "N/A"} mins)
      - Wellness entries: ${context.wellnessEntries?.length || 0} (latest: ${context.wellnessEntries?.[0]?.note || "N/A"})
    `;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a supportive college wellness assistant. 
            Rules:
            - Be short (1–5 casual sentences max).
            - Sound friendly, like a peer/friend, not a formal coach.
            - Always ground advice in the context provided below.
            - If the context is empty, encourage the user to log something.

            Here’s the latest context:
            ${contextSummary}
                      `,
                    },
                    ...history,
                    { role: "user", content: message },
                  ],
                  temperature: 0.7,
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

const PORT = process.env.PORT || 3001;          
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
