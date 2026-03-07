import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


import connectDB from "./config/db.js";

// =========================
// ⭐ Load Environment Variables & Connect DB
// =========================
dotenv.config({ override: true });
connectDB();

const app = express();

// =========================
// ⭐ Middlewares
// =========================
app.set('trust proxy', 1); // Respect proxy headers (important for Render/Vercel)

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://nexendemoecom.vercel.app",
      "https://zippyecomdemo.vercel.app",
    ],
    credentials: true,
  })
);

app.use(helmet());

// 1. JSON & URL Encoded Payload Size Limiting (Prevents large payload attacks)
// MUST be before sanitization to populate req.body
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// Express 5 Security Middleware (Fixes Compatibility with Read-Only Getters)
// Replaces express-mongo-sanitize and xss-clean by sanitizing in-place
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach(key => {
      // 1. NoSQL Injection Protection: Prevent keys starting with $ or containing .
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        return;
      }

      let value = obj[key];

      // 2. Recursive Sanitization for Nested Objects
      if (value && typeof value === 'object') {
        sanitize(value);
      }
      // 3. XSS Protection for Strings (Basic)
      else if (typeof value === 'string') {
        // Simple XSS strip (removes common script tags and handlers)
        obj[key] = value
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .replace(/on\w+=".*?"/gi, '')
          .replace(/javascript:.*?;/gi, '');
      }
    });
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
});

// 2. Global Burst Limiter (Anti-DDoS)
// Limits to 100 requests every 1 minute to prevent traffic spikes from taking the system down
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Service is receiving high traffic. Please try again in 1 minute.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// 3. Auth Limiter (Brute Force Protection)
// Adjusted for better UX: 15 attempts every 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many login/register attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/admin/auth/login", authLimiter);
app.use("/api/customer/auth/login", authLimiter);
app.use("/api/admin/auth/register", authLimiter); // Protect registration too
app.use("/api/customer/auth/register", authLimiter);

// Disable Express signature in production
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

// =========================
// ⭐ ROUTE IMPORTS
// =========================
import customerAuthRoutes from "./routes/customerAuthRoutes.js";

import productRoutes from "./routes/productRoutes.js";
import customerProductRoutes from "./routes/customerProductRoutes.js";

import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";



import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";

import addressRoutes from "./routes/addressRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import notificationRoutes from "./routes/notificationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";


// =========================
// ⭐ ADMIN ROUTES
// =========================
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);




// =========================
// ⭐ CUSTOMER ROUTES
// =========================
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/products/customer", customerProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Hero Section Routes
import heroRoutes from "./routes/heroRoutes.js";
app.use("/api/hero", heroRoutes);


// =========================
// ⭐ GLOBAL ROUTES (USED BY ALL)
// =========================
app.use("/api/products", productRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);


// =========================
// ⭐ DEFAULT ROUTE
// =========================
app.get("/", (req, res) => {
  res.json({ message: "🔥 Firecracker Marketplace API Running Successfully!" });
});


// =========================
// ⭐ GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("=== Global Error Handler ===");
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: "File upload error",
      error: err.message,
      code: err.code,
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: err.name,
  });
});


// =========================
// ⭐ START SERVER
// =========================
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

export default app;
