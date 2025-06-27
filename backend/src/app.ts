import "dotenv/config"
import express, { Request, Response } from "express"
import cors from "cors"
import { upload } from "./config/fileUpload"
import { upLoadController } from "./controllers/upload.controller"
import redis from "./config/redis"
import { db, runMigrations } from "./drizzle"
import { videos } from "./schema"
import { eq } from "drizzle-orm"

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

// get video status
app.get(
  "/video/:videoId",
  async (req: Request, res: Response): Promise<any> => {
    const { videoId } = req.params

    try {
      const data = await db.select().from(videos).where(eq(videos.id, videoId))

      if (data.length === 0) {
        return res.status(404).json({ message: "Video not found" })
      }

      return res.status(200).json(data[0])
    } catch (error) {
      console.error("Error fetching video:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

app.listen(process.env.PORT, () => {
  console.log("Server is running on port: ", process.env.PORT)
})
