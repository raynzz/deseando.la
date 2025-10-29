# Imagen mínima con Nginx
FROM nginx:alpine

# Copia todos los archivos del repo al directorio público de Nginx
COPY . /usr/share/nginx/html

# Expone el puerto HTTP
EXPOSE 80
