// src/app.ts - API server (Hono) with Next.js frontend
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { config } from "dotenv";

import { authMiddleware } from "./middleware/auth";

import authRoutes from "./routes/auth";
import sendRoutes from "./routes/send";
import reportRoutes from "./routes/report";
import configRoutes from "./routes/config";
import dashboardRoutes from "./routes/dashboard";

config();

const app = new Hono();

const frontendOrigin =
  process.env.FRONTEND_URL || "http://localhost:3001";

app.use(
  "*",
  cors({
    origin: frontendOrigin,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("*", logger());

app.use("*", async (c, next) => {
  const path = c.req.path;

  const publicPaths = ["/auth/", "/health"];

  if (publicPaths.some((p) => path.startsWith(p))) {
    return await next();
  }

  return await authMiddleware(c, next);
});

async function initializeDirectories() {
  const dirs = ["./uploads", "./logs", "./data"];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

app.route("/", authRoutes);
app.route("/", sendRoutes);
app.route("/", reportRoutes);
app.route("/", configRoutes);
app.route("/", dashboardRoutes);

app.get("/health", (c) => {
  return c.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "2.0.0-nextjs",
  });
});

app.get("/user/info", async (c) => {
  try {
    const token = c.req.cookie("session_token");
    if (!token) {
      return c.json({ success: false, message: "Not authenticated" }, 401);
    }

    const { userDatabase } = await import("./services/userDatabase");
    const user = userDatabase.validateSession(token);
    if (!user) {
      return c.json({ success: false, message: "Session expired" }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching user info" }, 500);
  }
});

app.notFound((c) => {
  return c.json({ success: false, message: "Endpoint not found" }, 404);
});

app.onError((err, c) => {
  console.error("Application error:", err);
  return c.json(
    {
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500
  );
});

const port = process.env.PORT || 3000;

console.log("🚀 Initializing Bulk Email Sender API...");
await initializeDirectories();

console.log("\n📋 Configuration Status:");
if (process.env.SMTP_HOST) {
  console.log("✅ Global SMTP configuration found in environment variables");
} else {
  console.log("⚠️  No global SMTP configuration in .env");
}

console.log(`\n🌐 API server: http://localhost:${port}`);
console.log(`   🖥️  Frontend (dev): ${frontendOrigin}`);

setTimeout(async () => {
  try {
    const { userDatabase } = await import("./services/userDatabase");
    userDatabase.cleanExpiredSessions();
    console.log("🧹 Cleaned expired sessions on startup");
  } catch (error) {
    console.error("Error cleaning expired sessions:", error);
  }
}, 1000);

export default {
  port,
  fetch: app.fetch,
};
