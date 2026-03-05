// server.js
import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json({ limit: "5mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("server is live"));

connectDB()
  
   
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
