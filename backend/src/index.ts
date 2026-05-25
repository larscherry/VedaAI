import express from "express";
import cors from "cors";
import { createServer } from "http";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import assignmentRoutes from "./routes/assignment.routes";
import authRoutes from "./routes/auth.routes";
import groupRoutes from "./routes/group.routes";
import notificationRoutes from "./routes/notification.routes";
import { setupWebSocket } from "./websocket";

const app = express();
const server = createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.redirect("http://localhost:3000");
});

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

setupWebSocket(server);

async function start() {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

start().catch(console.error);
