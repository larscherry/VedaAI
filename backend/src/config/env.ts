import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/vedaai",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "vedaai-jwt-secret-dev-only",
  USE_MOCK_LLM: process.env.USE_MOCK_LLM === "true",
  LLM_BASE_URL: process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1",
  LLM_MODEL: process.env.LLM_MODEL || "llama3-70b-8192",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
};
