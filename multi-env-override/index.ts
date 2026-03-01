import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import Redis from "ioredis";
import mongoose from "mongoose";
import { User } from "./src/models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/multi-env";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_DB = Number(process.env.REDIS_DB) || 0;
const PORT = Number(process.env.PORT) || 3000;

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_DB,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

const app = express();
app.use(morgan("dev"));
app.use(express.json());

const CACHE_KEY = "users";

app.get("/", async (_req: express.Request, res: express.Response) => {
  try {
    let cached = null;
    try {
      cached = await redis.get(CACHE_KEY);
    } catch (err) {
      console.error("Redis unavailable, bypassing cache");
    }

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const users = await User.find().lean();
    try {
      await redis.set(CACHE_KEY, JSON.stringify(users));
    } catch (err) {
      console.error("Redis unavailable, bypassing cache");
    }
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    try {
      await redis.del(CACHE_KEY);
    } catch (err) {
      console.error("Redis unavailable, bypassing cache invalidation");
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
