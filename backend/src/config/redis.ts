import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
})

redis.on("connect", () => {
  console.log("🔌 Redis client connected")
})

export default redis
