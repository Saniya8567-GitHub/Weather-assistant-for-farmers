// server/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import favRoutes from "./routes/favorites.js";

dotenv.config();

const app = express();
app.use(cors()); // dev: allows all origins. In prod, restrict origins.
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favRoutes);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server listening on port", PORT));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
