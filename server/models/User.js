// server/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: { type: [String], default: [] } // store city names, e.g. "Delhi"
});

export default mongoose.model("User", UserSchema);
