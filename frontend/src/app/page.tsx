import Link from "next/link"

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <main className="flex flex-col gap-5 items-center">
        <h1 className="text-5xl md:text-7xl">StreamFlix</h1>
        <h1 className="text-4xl">Upload and stream videos</h1>
        <div className="flex items-center justify-center gap-10">
          <button className="rounded-full bg-blue-600 text-white px-4 py-2 cursor-pointer">
            <Link href="/videos">Watch videos</Link>
          </button>
        </div>
      </main>
    </div>
  )
}
