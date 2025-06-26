import fs from "fs"
import ffmpeg from "fluent-ffmpeg"
import path from "path"
import { db } from "./drizzle"
import { videos } from "./schema"
import { eq } from "drizzle-orm"

interface resolutionTypes {
  resolutions: Record<string, string>
}

interface transcodingJob {
  videoId: string
  inputPath: string
  outputDir: string
}

const QUALITY_PRESETS = {
  "360p": {
    resolution: "640x360",
    videoBitrate: "800k",
    audioBitrate: "96k",
    scale: "scale=640:360",
  },
  "480p": {
    resolution: "854x480",
    videoBitrate: "1400k",
    audioBitrate: "128k",
    scale: "scale=854:480",
  },
  "720p": {
    resolution: "1280x720",
    videoBitrate: "2800k",
    audioBitrate: "128k",
    scale: "scale=1280:720",
  },
  "1080p": {
    resolution: "1920x1080",
    videoBitrate: "5000k",
    audioBitrate: "192k",
    scale: "scale=1920:1080",
  },
}

export class TranscodeWorker {
  private async getVideoMetadata(inputPath: string): Promise<any> {
    // get metadata for uploaded video
    return new Promise((resolve, reject) => {
      console.log(`Getting metadata for: ${inputPath}`)
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          console.error(`FFprobe error for ${inputPath}:`, err)
          reject(err)
        } else {
          console.log(`Metadata obtained for ${inputPath}`)
          resolve(metadata)
        }
      })
    })
  }

  // get video resolutions to transcode based on original height of uploaded video
  private getResolutionsToGenerate(originalHeight: number): string[] {
    const resolutions = []

    if (originalHeight >= 360) resolutions.push("360p")
    if (originalHeight >= 480) resolutions.push("480p")
    if (originalHeight >= 720) resolutions.push("720p")
    if (originalHeight >= 1080) resolutions.push("1080p")

    console.log(
      `Original height: ${originalHeight}px, generating resolutions: ${resolutions.join(
        ", "
      )}`
    )
    return resolutions
  }

  private async transcodeVideoToResolution(
    inputPath: string,
    outputPath: string,
    resolution: string
  ): Promise<void> {
    const preset = QUALITY_PRESETS[resolution as keyof typeof QUALITY_PRESETS]

    console.log(`Starting transcoding to ${resolution}: ${outputPath}`)

    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      ffmpeg(inputPath)
        .outputOptions([
          "-c:v libx264",
          "-c:a aac",
          `-b:v ${preset.videoBitrate}`,
          `-b:a ${preset.audioBitrate}`,
          `-vf ${preset.scale}`,
          "-preset fast",
          "-crf 23",
          "-movflags +faststart",
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log(`FFmpeg command: ${commandLine}`)
        })
        .on("end", () => {
          // actively track remaining time to transcode
          const duration = ((Date.now() - startTime) / 1000).toFixed(2)
          console.log(
            `✅ Transcoded to ${resolution} in ${duration}s: ${outputPath}`
          )
          resolve()
        })
        .on("error", (err) => {
          console.error(`❌ Error transcoding to ${resolution}:`, err.message)
          reject(err)
        })
        .on("progress", (progress) => {
          const percent = Math.round(progress.percent || 0)
          console.log(`${resolution}: ${percent}% complete`)
        })
        .run()
    })
  }

  async transcodeVideo(job: transcodingJob) {
    const { videoId, inputPath, outputDir } = job
    console.log(`🎬 Starting transcoding for video ${videoId}`)
    console.log(`Input: ${inputPath}`)
    console.log(`Output directory: ${outputDir}`)

    try {
      // Create output directory if doesn't exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Get video metadata
      const metadata = await this.getVideoMetadata(inputPath)
      const originalHeight = metadata.streams[0]?.height || 1080

      // Determine which resolutions to generate based on original quality
      const resolutionsToGenerate =
        this.getResolutionsToGenerate(originalHeight)

      // Transcode to different resolutions
      const resolutionPaths: Record<string, string> = {}

      // transcode given video to each resolution
      for (const resolution of resolutionsToGenerate) {
        const outputPath = path.join(outputDir, `${resolution}.mp4`)
        await this.transcodeVideoToResolution(inputPath, outputPath, resolution)
        resolutionPaths[resolution] = `videos/${videoId}/${resolution}.mp4`
      }

      // Update video status
      await this.updateVideoStatus(videoId, "completed", {
        resolutions: resolutionPaths,
      })

      // Clean up original file
      fs.unlinkSync(inputPath)

      console.log(`Video ${videoId} transcoded successfully`)
    } catch (error) {
      console.error(`Transcoding failed for video ${videoId}:`, error)
      await this.updateVideoStatus(videoId, "failed")
      throw error
    }
  }

  // update the video status
  async updateVideoStatus(
    videoId: string,
    status: string,
    data?: resolutionTypes
  ) {
    await db
      .update(videos)
      .set({
        status: status,
        resolutions: data,
      })
      .where(eq(videos.id, videoId))
  }
}
