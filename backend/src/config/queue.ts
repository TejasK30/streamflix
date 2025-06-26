import { Queue } from "bullmq"
import redis from "./redis"

// queue setup
export const transcodingQueue = new Queue("transcoding-queue", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
  },
})
