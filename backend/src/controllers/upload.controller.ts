import { Request, Response } from "express"
import { v4 as uuidV4 } from "uuid"
import { transcodingQueue } from "../config/queue"
import { db } from "../drizzle"
import { videos } from "../schema"

export const upLoadController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: "File is required" })
    }

    const videoId = uuidV4()
    console.log(`📤 Uploading video: ${videoId}`)
    console.log(`📁 File: ${file.originalname}`)
    console.log(`💾 Saved as: ${file.filename}`)

    // adding video info to db
    await db.insert(videos).values({
      id: videoId,
      originalName: file.originalname,
      filename: file.filename,
      status: "processing",
      hlsPlaylist: {},
    })

    console.log(`Video metadata saved to database`)

    // adding job to queue
    const job = await transcodingQueue.add("transcode-video", {
      videoId,
      inputPath: file?.path,
      outputDir: `videos/${videoId}`,
    })

    console.log(`Transcoding job added to queue with ID: ${job.id}`)

    return res.json({
      videoId,
      status: "processing",
      message: "Video Upload successful. now processing",
      jobId: job.id,
    })
  } catch (error) {
    console.error("❌ Upload failed:", error)
    return res.status(500).json({
      message: "Upload failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
