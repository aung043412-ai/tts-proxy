import express from "express";
import fetch from "node-fetch";

const app = express();

// CORS (Acode/Browser ကနေခေါ်လို့ရအောင်)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/", (req, res) => res.send("TTS server running ✅"));

function splitText(text, maxLen = 180) {
  const parts = [];
  let t = text.replace(/\s+/g, " ").trim();

  while (t.length > maxLen) {
    // space နဲ့ ဖြတ်ပေးမယ် (မရှိရင် hard cut)
    let cut = t.lastIndexOf(" ", maxLen);
    if (cut < 60) cut = maxLen;
    parts.push(t.slice(0, cut).trim());
    t = t.slice(cut).trim();
  }
  if (t) parts.push(t);
  return parts;
}

app.get("/tts", async (req, res) => {
  const text = (req.query.text || "").toString().trim();
  const lang = (req.query.lang || "my").toString().trim(); // my / en / th

  if (!text) return res.status(400).send("Missing text");

  // ✅ Myanmar ကို my-MM သုံး (ပိုမှန်)
  const langMap = { my: "my-MM", en: "en", th: "th" };
  const tl = langMap[lang] || "my-MM";

  // ✅ client=gtx က အချို့ဖုန်း/region မှာ ပို stable
  const client = "gtx";

  // ✅ စာရှည်ရင် ခွဲ
  const chunks = splitText(text, 180);

  try {
    const buffers = [];

    for (const chunk of chunks) {
      const url =
        "https://translate.google.com/translate_tts?ie=UTF-8&q=" +
        encodeURIComponent(chunk) +
        "&tl=" +
        tl +
        "&client=" +
        client;

      const r = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      });

      if (!r.ok) {
        const msg = await r.text();
        return res.status(500).send("TTS fetch failed: " + msg);
      }

      const arr = await r.arrayBuffer();
      buffers.push(Buffer.from(arr));
    }

    // ✅ audio stream ပြန်ပို့
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Disposition", 'inline; filename="tts.mp3"');
    res.send(Buffer.concat(buffers));
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server started on", port));
