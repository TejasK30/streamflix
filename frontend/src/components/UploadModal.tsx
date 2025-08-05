"use client"

import { useState } from "react"

const UploadModal = () => {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
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

  const openModal = () => {
    setOpen(true)
    setTimeout(() => {
      setVisible(true)
    }, 10)
  }
  const closeModal = () => {
    setVisible(false)
    setTimeout(() => {
      setOpen(false)
    }, 10)
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full px-4 max-h-[calc(100vh-100px)] overflow-hidden">
        <button
          onClick={openModal}
          className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded fond-semibold"
        >
          Upload video
        </button>
        {open && (
          <>
            <div
              className={`flex flex-col items-center justify-center bg-gray-800 w-full max-w-3xl max-h-[90vh] sm:h-[80vh] overflow-y-auto rounded-xl shadow-xl p-6 transform transition-all duration-300 ease-in-out ${
                visible
                  ? "opacity-100 scale-100 translate-y-2"
                  : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div
                onClick={closeModal}
                className="bg-red-600 text-white p-2 rounded top-3 right-3 absolute cursor-pointer"
              >
                close
              </div>
              <p className="text-gray-200 text-lg">
                Drag and drop a video here or click below
              </p>

              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
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
          </>
        )}
      </div>
    </>
  )
}

export default UploadModal
