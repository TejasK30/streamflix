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

      const mergedOptions = {
        ...options,
        responsive: true,
        fluid: true,
        html5: {
          ...((options as any).html5 ?? {}),
          vhs: {
            limitRenditionByPlayerDimensions: false,
            useDevicePixelRatio: true,
            bandwidth: 5_000_000,
            ...((options as any).html5?.vhs ?? {}),
          },
        },
      }

      const player = (playerRef.current = videojs(
        videoElement as unknown as HTMLVideoElement,
        mergedOptions,
        () => {
          // @ts-ignore
          player.hlsQualitySelector?.({
            displayCurrentQuality: true,
          })
          videojs.log("player is ready")
          onReady?.(player)
        },
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

  // ✅ Give the container explicit dimensions so VHS doesn't measure 0×0
  return (
    <div data-vjs-player style={{ width: "100%", aspectRatio: "16/9" }}>
      <div ref={videoRef} />
    </div>
  )
}

export default VideoPlayer
