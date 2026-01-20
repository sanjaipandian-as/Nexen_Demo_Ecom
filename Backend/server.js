import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";

import connectDB from "./config/db.js";

// =========================
// ⭐ Load Environment Variables & Connect DB
// =========================
console.log('DEBUG: process.env.PORT before config:', process.env.PORT);
dotenv.config({ override: true });
console.log('DEBUG: process.env.PORT after config:', process.env.PORT);
connectDB();

const app = express();

// =========================
// ⭐ Middlewares
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://zippydemoecom.vercel.app"
    ],
    credentials: true,
  })
);

app.use(helmet());
// app.use(mongoSanitize());
// app.use(xss());

app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 2000,
    message: "Too many requests from this IP, please try again later.",
  })
);

// Disable Express signature in production
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

app.use(express.json());

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
