FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Production stage: serve with nginx ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: send all 404s back to index.html so React Router handles them
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
