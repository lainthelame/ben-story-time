# Stage 1: Build the application with dependencies
FROM node:14 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --build-from-source sqlite3
COPY . .

# Stage 2: Create a lightweight production image
FROM node:14-alpine

WORKDIR /app
COPY --from=builder /app /app

# Install only production dependencies
RUN npm install --production

EXPOSE 3000
CMD ["npm", "start"]
