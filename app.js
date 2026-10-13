import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Middleware
app.use(express.json());

export default app;