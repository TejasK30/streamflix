import { worker } from "./config/workerConfig"

console.log("🎥 Worker started. Waiting for jobs...")

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...")
  try {
    await worker.close()
    console.log("✅ Shutdown complete.")
    process.exit(0)
  } catch (err) {
    console.error("❌ Error during shutdown:", err)
    process.exit(1)
  }
})

setInterval(() => {}, 60 * 60 * 1000)
