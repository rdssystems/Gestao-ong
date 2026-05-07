# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Default command for development (can be overridden by docker-compose)
CMD ["npm", "run", "dev"]

# Production stage (kept for future use)
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.js ./

RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

# Ensure the user has permissions to the volume at runtime
CMD ["sh", "-c", "mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads && npx prisma db push && npm start"]

