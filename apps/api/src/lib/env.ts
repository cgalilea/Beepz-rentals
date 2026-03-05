import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
// Also try loading from the repo root
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  JWT_SECRET: process.env.JWT_SECRET || "fallback-dev-secret",
  DATABASE_URL: process.env.DATABASE_URL || "",
};
