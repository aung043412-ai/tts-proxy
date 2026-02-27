import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", (req, res) => {
  res.send("TTS server running");
});

app.get("/tts", async (req, res) => {
  const text = req.query.text || "hello";

  try {
    const url =
      "https://translate.google.com/translate_tts?ie=UTF-8&q=" +
      encodeURIComponent(text) +
      "&tl=en&client=tw-ob";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const buffer = await response.arrayBuffer();

    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buffer));
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server started"));
