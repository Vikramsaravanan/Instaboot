FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install OS dependencies needed for node-gyp (native modules)
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "src/index.js"]
