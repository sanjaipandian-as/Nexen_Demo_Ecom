import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // ⭐ never expose password
    },

    role: {
      type: String,
      default: "admin",
      immutable: true, // ⭐ cannot be changed
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
