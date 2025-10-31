# Etapa 1: build con Node
FROM node:18 AS build
WORKDIR /app

# Argumentos de build para variables de entorno
ARG VITE_DIRECTUS_URL
ARG VITE_DIRECTUS_TOKEN
ARG VITE_APP_VERSION=1.0.0
ARG VITE_BUILD_TIME
ARG VITE_GIT_COMMIT

# Crear .env con las variables de producción
RUN echo "VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL}" > .env
RUN echo "VITE_DIRECTUS_TOKEN=${VITE_DIRECTUS_TOKEN}" >> .env
RUN echo "VITE_APP_VERSION=${VITE_APP_VERSION}" >> .env
RUN echo "VITE_BUILD_TIME=${VITE_BUILD_TIME}" >> .env
RUN echo "VITE_GIT_COMMIT=${VITE_GIT_COMMIT}" >> .env

COPY . .
RUN npm install
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
