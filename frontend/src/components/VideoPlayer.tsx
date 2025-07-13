"use client"

import React, { useEffect, useRef } from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"

type options = typeof videojs.options

interface VideoPlayerProps {
  options: options
  onReady?: (player: any) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onReady }) => {
  const videoRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<any | null>(null)

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js")
      videoElement.classList.add("vjs-big-play-centered")

      videoRef.current.appendChild(videoElement)

      const player = (playerRef.current = videojs(
        videoElement as unknown as HTMLVideoElement,
        options,
        () => {
          // Initialize the HLS quality selector plugin
          // @ts-ignore
          player.hlsQualitySelector?.({
            displayCurrentQuality: true,
          })
          videojs.log("player is ready")
          onReady?.(player)
        }
      ))
    } else if (playerRef.current) {
      playerRef.current.autoplay(options.autoplay ?? false)
      playerRef.current.src(options.sources!)
    }
  }, [options, onReady])

  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [])

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  )
}

export default VideoPlayer
