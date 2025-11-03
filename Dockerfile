# Multi-stage build for Vite React + Express

# Stage 1: Build React app with Vite
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle (Vite buildaa dist/ kansioon)
RUN npm run build

# Stage 2: Production with Express
FROM node:22-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built React app from build stage (dist/ ei build/)
COPY --from=build /app/dist ./dist

# Copy Express server
COPY server.js .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start Express server
CMD ["node", "server.js"]