CREATE TABLE "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"originalName" text NOT NULL,
	"filename" text NOT NULL,
	"status" text,
	"resolutions" jsonb DEFAULT '{}'::jsonb,
	"hls_playlist" text,
	"created_at" timestamp DEFAULT now()
);
