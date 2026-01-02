FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY webpack.config.js ./

# Install dependencies and build
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/bundle.js /usr/share/nginx/html/
COPY index.html /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

# Note: We don't need res/ or src/ in production as everything is bundled
