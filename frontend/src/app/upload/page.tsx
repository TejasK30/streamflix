"use client"

import UploadModal from "@/components/UploadModal"
import React, { useState } from "react"

const UploadPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-8 max-h-[calc(100vh-100px)] overflow-hidden">
      <h1 className="text-3xl font-semibold mb-6">Welcome to StreamFlix</h1>

      <UploadModal />
    </div>
  )
}

export default UploadPage
