FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_APPWRITE_ENDPOINT=https://appwrite.vibecoding.by/v1
ENV VITE_APPWRITE_PROJECT_ID=69aa2114000211b48e63
ENV VITE_APPWRITE_DATABASE_ID=vibecoding
ENV VITE_API_URL=https://vibecoding.by/functions/v1
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
