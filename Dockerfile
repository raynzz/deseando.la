# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Cache-friendly
COPY package*.json ./
RUN npm ci

# Copiamos el código
COPY . .

# 🔧 Forzamos recompilación en cada deploy cambiando este valor:
ARG APP_BUILD_ID=2025-10-31-1829
ENV APP_BUILD_ID=${APP_BUILD_ID}

# 🔐 Variables que Vite leerá en build-time
# IMPORTANT: deja aquí el host de Directus
ENV VITE_DIRECTUS_URL=https://hoztlat-regalos.6vlrrp.easypanel.host
# (opcional) ENV VITE_DIRECTUS_TOKEN=tu_token_publico

# 🧪 Log para verificar en EasyPanel qué valor se “hornea”
RUN echo ">>> BUILD ENV: VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL}"

# Build del front
RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# (Opcional SPA fallback)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
