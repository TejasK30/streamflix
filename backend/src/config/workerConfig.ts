import { Job, Worker } from "bullmq"
import { TranscodeWorker } from "../Worker"
import redis from "./redis"

// setup worker and transcode the video

interface TranscodingJobData {
  videoId: string
  inputPath: string
  outputDir: string
}

const transcoder = new TranscodeWorker()
type TranscodingJob = Job<TranscodingJobData>

const worker: Worker<TranscodingJobData> = new Worker<TranscodingJobData>(
  "transcoding-queue",
  async (job: TranscodingJob): Promise<void> => {
    console.log(`🎬 Processing job ${job.id}: ${job.data.videoId}`)
    console.log(`📁 Input: ${job.data.inputPath}`)
    console.log(`📂 Output: ${job.data.outputDir}`)

    try {
      // add the video to worker
      await transcoder.transcodeVideo({
        videoId: job.data.videoId,
        inputPath: job.data.inputPath,
        outputDir: job.data.outputDir,
      })

      console.log(`✅ Transcoding completed for ${job.data.videoId}`)
    } catch (error) {
      console.error(`❌ Transcoding failed for ${job.data.videoId}:`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 2,
  }
)

worker.on("completed", (job: TranscodingJob): void => {
  console.log(`Job ${job.id} completed successfully`)
})

worker.on("failed", (job: TranscodingJob | undefined, err: Error): void => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

worker.on("error", (err: Error): void => {
  console.error("Worker error:", err)
})

worker.on("ready", (): void => {
  console.log("Worker is ready and connected to Redis")
})

console.log("Video transcoding worker started")
