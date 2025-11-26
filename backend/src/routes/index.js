import { Router } from "express";
import productRouter from "./product.route.js";

const router = Router();

// Grouped routes (v1 style for future scalability)
router.use("/products", productRouter);

// Health check endpoint (useful for uptime monitoring)
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running smoothly 🚀" });
});

// 404 handler for unknown routes
router.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

export default router;
