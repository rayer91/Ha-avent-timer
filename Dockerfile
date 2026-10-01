FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production runtime container with Home Assistant Supervisor API support
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8099

COPY package*.json ./
RUN npm install

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig*.json ./

EXPOSE 8099

CMD ["npx", "tsx", "server.ts"]
