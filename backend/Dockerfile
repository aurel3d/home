FROM node:18-alpine

RUN apk add --no-cache ffmpeg
RUN apk add --no-cache sox
# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm run db:generate

# Build the application
RUN pnpm run build

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["pnpm", "start"]