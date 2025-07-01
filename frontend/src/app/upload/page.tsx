"use client"

import React, { useState } from "react"

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  const isVideoFile = (file: File) => file.type.startsWith("video/")

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (!isVideoFile(droppedFile)) {
        setError("Only video files are allowed.")
        return
      }
      setFile(droppedFile)
      setError("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!isVideoFile(selectedFile)) {
        setError("Only video files are allowed.")
        return
      }
      setFile(selectedFile)
      setError("")
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.set("file", file)

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        console.log("File uploaded successfully")
        setFile(null)
        setError("")
      } else {
        setError("Upload failed.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Error uploading file.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      <h1 className="text-2xl font-semibold mb-6">Upload Video</h1>

      <div
        className={`w-full max-w-md border-2 border-dashed border-gray-400 rounded-lg p-10 bg-gray-700 flex flex-col items-center gap-4 ${
          dragActive ? "bg-blue-100" : ""
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <p className="text-gray-200">
          Drag and drop a video here or click below
        </p>

        <label className="cursor-pointer bg-gray-500 px-4 py-2 rounded hover:bg-gray-600 transition-colors">
          Choose File
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {file && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">Selected: {file.name}</p>
          <button
            onClick={uploadFile}
            disabled={uploading}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {uploading ? "Uploading..." : "Upload Now"}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default UploadPage
