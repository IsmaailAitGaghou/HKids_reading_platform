import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  const stateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.status(200).json({
    status: "ok",
    database: stateMap[mongoose.connection.readyState] ?? "unknown",
    timestamp: new Date().toISOString()
  });
});

export default router;
