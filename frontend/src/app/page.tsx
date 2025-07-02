import Link from "next/link"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-7xl">StreamFlix</h1>

        <h1 className="text-4xl">Upload and stream videos</h1>
        <div className="flex gap-10">
          <button className="rounded-full bg-gray-700 px-2 py-2 cursor-pointer">
            <Link href="/vidoes">Get Started</Link>
          </button>
          <button className="rounded-full bg-blue-700 px-2 py-2 cursor-pointer">
            Learn More
          </button>
        </div>
      </main>
    </div>
  )
}
