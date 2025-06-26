import "dotenv/config"
import express, { Request, Response } from "express"
import cors from "cors"
import { upload } from "./config/fileUpload"
import { upLoadController } from "./controllers/upload.controller"
import redis from "./config/redis"
import { runMigrations } from "./drizzle"

const app = express()

// apply migrations to the db
async function startServer() {
  await runMigrations()
}

startServer()

app.use(
  cors({
    origin: "*",
  })
)
app.use(express.json())

app.post("/upload", upload.single("file"), upLoadController)

app.get("/health", async (req: Request, res: Response) => {
  try {
    const ping = await redis.ping()
    res.json({
      message: "Backend is healthy ✅",
      redis: ping === "PONG" ? "connected" : "disconnected",
    })
  } catch (err) {
    res.status(500).json({ message: "Redis error ❌", error: err })
  }
})

app.listen(process.env.PORT, () => {
  console.log("Server is running on port: ", process.env.PORT)
})
