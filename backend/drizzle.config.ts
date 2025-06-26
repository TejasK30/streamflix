import { Config, defineConfig } from "drizzle-kit"
import "dotenv/config"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}) satisfies Config
