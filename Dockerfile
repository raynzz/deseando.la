# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias con cache eficiente
COPY package*.json ./
RUN npm ci

# Copiar el código
COPY . .

# Compilar el front (sin depender de VITE_* en build)
RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine

# Copiamos artefactos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos la plantilla de config runtime y el entrypoint
COPY config.js.template /usr/share/nginx/html/config.js.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# (Opcional SPA) si refrescás rutas internas y ves 404, en el próximo paso te doy un nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
