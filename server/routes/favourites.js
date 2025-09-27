// server/routes/favorites.js
import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/favorites
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("favorites email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/favorites  { city: "Delhi" }
router.post("/", auth, async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ message: "City required" });
    const user = await User.findById(req.userId);
    if (!user.favorites.includes(city)) {
      user.favorites.push(city);
      await user.save();
    }
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/favorites/:city
router.delete("/:city", auth, async (req, res) => {
  try {
    const city = decodeURIComponent(req.params.city);
    const user = await User.findById(req.userId);
    user.favorites = user.favorites.filter((c) => c !== city);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
