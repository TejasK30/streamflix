"use client"

import Link from "next/link"
import { useState } from "react"

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-5 max-w-7xl mx-auto w-full bg-blue-500 text-white sticky top-0 z-50 shadow-md">
      <Link href="/" className="text-2xl font-bold">
        StreamFlix
      </Link>
      <div className="flex items-center gap-4">
        <button className="px-2 py-1 hover:bg-blue-600 transition duration-200">
          <Link href={"/upload"}>Uplaod video</Link>
        </button>
        <button className="px-2 py-1 hover:bg-blue-600 transition duration-200">
          <Link href={"/videos"}>Watch videos</Link>
        </button>
      </div>
    </div>
  )
}

export default Navbar
