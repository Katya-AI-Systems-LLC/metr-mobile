# METR Mobile - Dockerfile for CI/CD
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build command (override in docker-compose or CI)
CMD ["npm", "start"]


