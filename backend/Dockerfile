FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache ffmpeg 

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/app.js"]
