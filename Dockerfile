# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Valor por defecto si no llega por build-arg ni .env
# (Si más adelante usas Build Args, puedes cambiar esta ENV por ARG+ENV)
ENV VITE_DIRECTUS_URL=https://hoztlat-regalos.6vlrrp.easypanel.host

# (Opcional) Solo si de verdad necesitas token público horneado:
# ENV VITE_DIRECTUS_TOKEN=tu_token

RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# (Opcional) SPA fallback si usas rutas cliente:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
