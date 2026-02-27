import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/tts", async (req, res) => {
  try {
    const text = req.query.text || "hello";

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    const buffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buffer));

  } catch (e) {
    res.send("error");
  }
});

app.listen(3000);
