"use client"

import React, { useEffect, useRef } from "react"
import videojs from "video.js"

type options = typeof videojs.options

import "video.js/dist/video-js.css"

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
