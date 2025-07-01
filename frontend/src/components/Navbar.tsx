"use client"

import { useState } from "react"

const Navbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2 w-full items-center justify-between p-5 bg-blue-500 overflow-hidden rounded sticky flex-wrap">
        <div className="text-2xl font-bold">StreamFlix</div>
        <button
          onClick={() => setIsNavbarOpen(!isNavbarOpen)}
          className="block md:hidden"
        >
          {isNavbarOpen ? (
            <>
              {/* Close Icon (X) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </>
          ) : (
            <>
              {/* Hamburger Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </>
          )}
        </button>

        <div
          className={`${
            isNavbarOpen ? "max-h-screen opacity-100 mt-2" : "max-h-0 opacity-0"
          }
            overflow-hidden transition-all duration-500 ease-in-out
            w-full flex-col items-center
            md:flex md:max-h-screen md:opacity-100 md:w-auto md:flex-row md:gap-10 md:mt-0`}
        >
          <div className="p-1 hover:bg-blue-700">
            <h2>Home</h2>
          </div>
          <div className="p-1 hover:bg-blue-700">
            <h2>About</h2>
          </div>
          <div className="p-1 hover:bg-blue-700">
            <h2>Dashboard</h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
