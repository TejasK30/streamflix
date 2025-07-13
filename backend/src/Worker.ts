import { eq } from "drizzle-orm"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import { db } from "./drizzle"
import { videos } from "./schema"

interface resolutionTypes {
  resolutions: Record<string, string>
}
interface hlsPlaylistsTypes {
  hlsPlaylists: Record<string, string>
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
    height: 360,
  },
  "480p": {
    resolution: "854x480",
    videoBitrate: "1400k",
    audioBitrate: "128k",
    scale: "scale=854:480",
    height: 480,
  },
  "720p": {
    resolution: "1280x720",
    videoBitrate: "2800k",
    audioBitrate: "128k",
    scale: "scale=1280:720",
    height: 720,
  },
  "1080p": {
    resolution: "1920x1080",
    videoBitrate: "5000k",
    audioBitrate: "192k",
    scale: "scale=1920:1080",
    height: 1080,
  },
}

export class TranscodeWorker {
  // get metadata for uploaded video
  private async getVideoMetadata(inputPath: string): Promise<any> {
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

  // get video resolutions to transcode based on uploaded video height
  private getResolutionsToGenerate(originalHeight: number): string[] {
    const resolutions = Object.keys(QUALITY_PRESETS)

    const originalResolutionKey = `${originalHeight}p`
    const presetHeights = Object.values(QUALITY_PRESETS).map((p) => p.height)

    if (!presetHeights.includes(originalHeight)) {
      // Add custom resolution + preset if not already defined
      resolutions.push(originalResolutionKey)
      QUALITY_PRESETS[originalResolutionKey as keyof typeof QUALITY_PRESETS] = {
        resolution: `${Math.round(
          (originalHeight * 16) / 9
        )}x${originalHeight}`,
        videoBitrate: this.calculateBitrate(originalHeight),
        audioBitrate: originalHeight >= 720 ? "192k" : "128k",
        scale: `scale=${Math.round(
          (originalHeight * 16) / 9
        )}:${originalHeight}`,
        height: originalHeight,
      } as any
    }

    const uniqueResolutions = [...new Set(resolutions)]

    return uniqueResolutions
  }

  private calculateBitrate(height: number): string {
    // Calculate appropriate bitrate based on height
    if (height <= 360) return "800k"
    if (height <= 480) return "1400k"
    if (height <= 720) return "2800k"
    if (height <= 1080) return "5000k"
    // For higher resolutions, scale accordingly
    return `${Math.round((height / 1080) * 5000)}k`
  }

  // transcode video to each resolution and generate HLS playlist
  async transcodeVideo(job: transcodingJob) {
    const { videoId, inputPath, outputDir } = job
    console.log(`Starting transcoding for video ${videoId}`)
    console.log(`Input: ${inputPath}`)
    console.log(`Output directory: ${outputDir}`)

    try {
      const existingVideo = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))
        .limit(1)

      if (existingVideo.length === 0) {
        throw new Error(`Video with ID ${videoId} not found in database`)
      }

      const video = existingVideo[0]

      if (video.status === "completed") {
        console.log(`Video ${videoId} is already transcoded. Skipping.`)
        return
      }

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

      // Generate HLS playlists
      const hlsPath = await this.generateHLSPlaylist(
        inputPath,
        outputDir,
        resolutionsToGenerate
      )

      // update the video status and add generated paths in DB
      await this.updateVideoStatus(videoId, "completed", hlsPath)

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
    hlsPlaylist?: hlsPlaylistsTypes
  ) {
    const result = await db
      .update(videos)
      .set({
        status,
        hlsPlaylist: hlsPlaylist,
      })
      .where(eq(videos.id, videoId))
      .returning()
  }

  // generate hls playlist for video
  private async generateHLSPlaylist(
    inputPath: string,
    outputDir: string,
    resolutions: string[]
  ) {
    try {
      console.log("Starting HLS playlist generation...")

      // Create HLS output directory if it doesn't exist
      const hlsDir = path.join(outputDir, "hls")
      if (!fs.existsSync(hlsDir)) {
        console.log(`Creating HLS directory at: ${hlsDir}`)
        fs.mkdirSync(hlsDir, { recursive: true })
      }

      const hlsPlaylists: Record<string, string> = {}

      // Generate HLS .m3u8 playlist for each resolution
      const hlsPromises = resolutions.map((resolution) => {
        const preset =
          QUALITY_PRESETS[resolution as keyof typeof QUALITY_PRESETS]

        const outputPath = path.join(hlsDir, `${resolution}.m3u8`)

        console.time(`HLS generation for ${resolution}`)

        return new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions([
              "-c:v libx264",
              "-c:a aac",
              `-b:v ${preset.videoBitrate}`,
              `-b:a ${preset.audioBitrate}`,
              `-vf ${preset.scale}`,
              "-preset fast",
              "-crf 23",
              "-f hls",
              "-hls_time 10",
              "-hls_list_size 0",
              "-hls_segment_filename",
              path.join(hlsDir, `${resolution}_%03d.ts`),
            ])
            .output(outputPath)
            .on("start", () => {
              console.log(
                `Starting HLS Playlist generation for: [${resolution}] `
              )
            })
            .on("end", () => {
              console.timeEnd(`HLS generation for ${resolution}`)

              console.log(
                `[${resolution}] HLS stream generated at ${outputPath}`
              )
              hlsPlaylists[resolution] = `videos/${path.basename(
                outputDir
              )}/hls/${resolution}.m3u8`
              resolve(null)
            })
            .on("error", (err) => {
              console.error(
                `[${resolution}] HLS generation failed:`,
                err.message
              )
              console.timeEnd(`HLS generation for ${resolution}`)
              reject(err)
            })
            .run()
        })
      })

      await Promise.all(hlsPromises)

      console.log("All HLS variant playlists generated successfully")

      // Generate master.m3u8 playlist for all resolutions
      console.log("Generating master HLS playlist...")

      const masterPlaylistPath = path.join(hlsDir, "master.m3u8")
      const masterPlaylistContent = this.generateMasterPlaylist(resolutions)

      fs.writeFileSync(masterPlaylistPath, masterPlaylistContent)

      console.log(`Master playlist written to: ${masterPlaylistPath}`)

      hlsPlaylists["master"] = `videos/${path.basename(
        outputDir
      )}/hls/master.m3u8`

      return { hlsPlaylists }
    } catch (error) {
      console.error("HLS playlist generation failed:", error)
    }
  }

  private generateMasterPlaylist(resolutions: string[]): string {
    // Master HLS playlist format
    let content = "#EXTM3U\n#EXT-X-VERSION:3\n\n"

    for (const resolution of resolutions) {
      const preset = QUALITY_PRESETS[resolution as keyof typeof QUALITY_PRESETS]

      // Calculate bandwidth in bits per second
      const bandwidth = parseInt(preset.videoBitrate.replace("k", "")) * 1000
      const [width, height] = preset.resolution.split("x")

      // Add stream information and reference to variant playlist
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${width}x${height}\n`
      content += `${resolution}.m3u8\n\n`
    }

    console.log("Master playlist content generated successfully")
    return content
  }
}
