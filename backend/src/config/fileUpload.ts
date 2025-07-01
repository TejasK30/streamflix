import fs from "fs/promises"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"
import path from "path"

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads")

if (!existsSync(UPLOAD_DIR)) {
  fs.mkdir(UPLOAD_DIR, { recursive: true })
}

// initialize storage for video uploads
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, UPLOAD_DIR)
  },
  filename(req, file, callback) {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(
      file.originalname
    )}`
    callback(null, uniqueName)
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // only allowed types
    const allowedMimes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
    ]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid video format"))
    }
  },
})
