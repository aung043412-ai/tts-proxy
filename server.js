const express = require("express");

const app = express();

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL_ID =
  process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

// ===== MIDDLEWARE =====
app.use(express.json({ limit: "2mb" }));

// CORS FIX
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("tts-proxy running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, hasKey: !!ELEVENLABS_API_KEY });
});

// prevent wrong usage
app.get("/tts", (req, res) => {
  res.status(405).json({ error: "Use POST /tts" });
});

app.post("/tts", async (req, res) => {
  try {
    if (!ELEVENLABS_API_KEY)
      return res.status(500).json({ error: "Missing API key" });

    const text = (req.body?.text || "").toString().trim();
    if (!text) return res.status(400).json({ error: "Missing text" });

    const voiceId = req.body?.voiceId || DEFAULT_VOICE_ID;
    const modelId = req.body?.modelId || DEFAULT_MODEL_ID;

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      }
    );

    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).send(t);
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log("running on", PORT);
});
