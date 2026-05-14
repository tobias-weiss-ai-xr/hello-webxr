FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache gzip

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY --from=build /app/assets/ /usr/share/nginx/html/assets/
COPY --from=build /app/src/vendor/ /usr/share/nginx/html/src/vendor/

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html/
