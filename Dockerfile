# Stage 1: Build frontend application
FROM node:22-alpine AS builder

WORKDIR /app

# Ensure native compilation tools are available on all CPU architectures (ARM/x86)
RUN apk add --no-cache python3 make g++

# Copy package descriptors including lockfile
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build client
COPY . .
RUN npm run build

# Stage 2: Production runtime with Home Assistant Supervisor API support
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8099

# Install production dependencies (including tsx and express)
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled assets and server from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig*.json ./

EXPOSE 8099

CMD ["npx", "tsx", "server.ts"]
