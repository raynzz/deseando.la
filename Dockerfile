# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala deps primero (cache-friendly)
COPY package*.json ./
RUN npm ci

# Copia el código
COPY . .

# Build-time envs (Vite solo lee variables que empiecen con VITE_)
ARG VITE_DIRECTUS_URL
ARG VITE_DIRECTUS_TOKEN
ARG VITE_APP_VERSION=1.0.0

# Exporta al entorno del build (para Vite)
ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL \
    VITE_DIRECTUS_TOKEN=$VITE_DIRECTUS_TOKEN \
    VITE_APP_VERSION=$VITE_APP_VERSION

# Build del front
RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine

# Copia el build al docroot por defecto de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# (Opcional) si usas React Router y quieres history fallback:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
