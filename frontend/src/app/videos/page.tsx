"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

interface videoType {
  name: string
  url: string
}

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
})

const VideoPage = () => {
  const [videos, setVideos] = useState<videoType[]>([])

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("http://localhost:5000/videos")
        const data = await res.json()

        console.log(data)

        setVideos(data)
      } catch (error) {
        console.error("Failed to fetch videos:", error)
      }
    }

    fetchVideos()
  }, [])

  return (
    <>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Videos</h1>

        <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {videos.map((video, index) => (
            <>
              <div
                key={index}
                className="w-full rounded-sm shadow-lg overflow-hidden border"
              >
                <VideoPlayer
                  options={{
                    autoplay: false,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    sources: [
                      {
                        src: video.url,
                        type: "application/x-mpegURL",
                      },
                    ],
                  }}
                  onReady={(player) => {
                    console.log(`Player for ${video.name} is ready!`)
                  }}
                />
                <h2 className="text-sm font-semibold w-full p-2">
                  {video.name.replace(/\.mp4$/i, "")}
                </h2>
              </div>
            </>
          ))}
        </div>
      </main>
    </>
  )
}

export default VideoPage
