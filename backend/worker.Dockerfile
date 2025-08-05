FROM node:20-alpine

#install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# install ffmpeg 
RUN apk add --no-cache ffmpeg 

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile

COPY . . 

RUN pnpm run build

# Create directories
RUN mkdir -p uploads videos


CMD [ "node", "dist/Worker.js" ]