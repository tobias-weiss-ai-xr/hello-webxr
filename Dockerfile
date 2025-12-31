FROM nginx:alpine
COPY index.html bundle.js /usr/share/nginx/html/
COPY res /usr/share/nginx/html/res
COPY assets /usr/share/nginx/html/assets
COPY src /usr/share/nginx/html/src
