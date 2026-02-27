import express from "express";

const app = express();

app.get("/", (req,res)=>{
  res.send("TTS proxy running ✅");
});

app.listen(3000,()=>console.log("running"));
