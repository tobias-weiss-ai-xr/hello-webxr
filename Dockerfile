FROM nginx:alpine

# Copy pre-built bundle and html
COPY bundle.js /usr/share/nginx/html/
COPY index.html /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY src/vendor /usr/share/nginx/html/src/vendor
