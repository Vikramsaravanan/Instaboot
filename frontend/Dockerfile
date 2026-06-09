FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ── Serve with nginx ─────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config that proxies /api to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
