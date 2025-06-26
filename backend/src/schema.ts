import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export const videos = pgTable("videos", {
  id: text("id").primaryKey(),
  originalName: text("originalName").notNull(),
  filename: text("filename").notNull(),
  status: text("status"),
  resolutions: jsonb("resolutions").default({}),
  hlsPlaylist: text("hls_playlist"),
  createdAt: timestamp("created_at").defaultNow(),
})
