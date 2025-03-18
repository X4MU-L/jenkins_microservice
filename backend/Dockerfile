# Base stage for both development and production
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Development stage
FROM base AS dev
ENV NODE_ENV=development
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
CMD ["yarn", "run", "start:dev"]

# Build stage for production
FROM base AS build
WORKDIR /app
COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json yarn.lock ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Start the application
CMD ["node", "dist/main"]