# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Valor por defecto si no llega por build-arg ni .env
ARG VITE_DIRECTUS_URL_DEFAULT=https://hoztlat-regalos.6vlrrp.easypanel.host
# Permite override via build-arg VITE_DIRECTUS_URL; si no llega, usa el default
ENV VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL:-$VITE_DIRECTUS_URL_DEFAULT}

# (Opcional) Token — no recomendado “hornearlo” en prod
# ARG VITE_DIRECTUS_TOKEN_DEFAULT=
# ENV VITE_DIRECTUS_TOKEN=${VITE_DIRECTUS_TOKEN:-$VITE_DIRECTUS_TOKEN_DEFAULT}

RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
