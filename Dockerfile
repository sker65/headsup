# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Runtime stage
FROM nginx:1.27-alpine

RUN apk add --no-cache apache2-utils

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-auth.conf /etc/nginx/conf.d/auth.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public/config.js /usr/share/nginx/html/config.js
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
