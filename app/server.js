import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();

// --- CORS setup ---
const allowedOrigins = [
  "http://localhost:5173",                  // Vite dev
  "https://ai-student-coach-frontend.onrender.com" // your deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow curl, mobile apps, etc.
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Access denied for origin ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "OPTIONS"], // allow these HTTP methods
  credentials: true
}));

// parse JSON
app.use(express.json());

// --- OpenAI setup ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Basic status route ---
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "student-coach-express" });
});

// --- Chat history helpers ---
function getChatHistory(userId, limit = 10) {
  const stmt = db.prepare(
    `SELECT role, content FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT ?`
  );
  return stmt.all(userId, limit).reverse(); // oldest → newest
}

function saveMessage(userId, role, content) {
  const stmt = db.prepare(
    `INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)`
  );
  stmt.run(userId, role, content);
}

// --- Chat endpoint ---
app.post("/chat", async (req, res) => {
  const { message, userId = "default_user", context = {}, page } = req.body;

  try {
    saveMessage(userId, "user", message);

    const history = getChatHistory(userId);

    const contextSummary = `
      User dashboard snapshot:
      - Current page: ${page}
      - Todos: ${context.todoTasks?.length || 0} tasks (${context.todoTasks?.slice(0,3).map(t => t.title).join(", ") || "none"})
      - Sleep entries: ${context.sleepEntries?.length || 0} (latest: ${context.sleepEntries?.[0]?.hours || "N/A"} hrs)
      - Exercise entries: ${context.exerciseEntries?.length || 0} (latest: ${context.exerciseEntries?.[0]?.minutes || "N/A"} mins)
      - Wellness entries: ${context.wellnessEntries?.length || 0} (latest: ${context.wellnessEntries?.[0]?.note || "N/A"})
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a supportive college wellness assistant. 
            Rules:
            - Short, friendly (1–5 sentences max)
            - Always ground advice in the context provided
            - Encourage logging if context is empty
            Latest context:
            ${contextSummary}
          `
        },
        ...history,
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const aiReply = response.choices[0].message.content;
    saveMessage(userId, "assistant", aiReply);

    res.json({ reply: aiReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// --- Listen ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
