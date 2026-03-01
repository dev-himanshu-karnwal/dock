import express from "express";
import { PrismaClient } from "./generated/prisma_client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. In Docker, ensure docker-compose is run from the app directory so env_file: .env is used.",
  );
}

const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: 20000, // allow time for Neon cold start / slow networks
});

const redis = new Redis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: 1,   // fail fast
  retryStrategy(times) {
    if (times > 3) {
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000);
  },
});

const app = express();
const prisma = new PrismaClient({
  adapter,
});
app.use(express.json());

// Get all users
app.get("/", async (_req: express.Request, res: express.Response) => {
  try {
    let cachedUsers = null;
    try {
      cachedUsers = await redis.get("users");
    } catch (err) {
      console.error("Redis unavailable, bypassing cache");
    }

    if (cachedUsers) {
      return res.json(JSON.parse(cachedUsers));
    }
    const users = await prisma.user.findMany();
    try {
      await redis.set("users", JSON.stringify(users));
    } catch (err) {
      console.error("Redis unavailable, bypassing cache");
    }
    try {
      await redis.del("users");
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
    const user = await prisma.user.create({
      data: { name, email },
    });
    await redis.expire("users", 0);
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 3000;

async function main() {
  await prisma.$connect();
  console.log("connected to db");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
