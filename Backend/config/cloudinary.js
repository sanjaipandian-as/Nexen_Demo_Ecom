import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET,
});

// Debug: Check if credentials are loaded
console.log("🔧 Cloudinary Config:", {
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME) ? "✅ Set" : "❌ Missing",
  api_key: (process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY) ? "✅ Set" : "❌ Missing",
  api_secret: (process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET) ? "✅ Set" : "❌ Missing"
});

export default cloudinary;
