# Etapa 1: build con Node
FROM node:18 AS build
WORKDIR /app

# Argumentos de build para variables de entorno
ARG VITE_DIRECTUS_URL
ARG VITE_DIRECTUS_TOKEN

# Crear .env con las variables de producción
RUN echo "VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL}" > .env
RUN echo "VITE_DIRECTUS_TOKEN=${VITE_DIRECTUS_TOKEN}" >> .env

COPY . .
RUN npm install
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
