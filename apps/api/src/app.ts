import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import investorRoutes from "./routes/investor.routes";
import vehicleRoutes from "./routes/vehicle.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/investors", investorRoutes);
app.use("/vehicles", vehicleRoutes);

export default app;
