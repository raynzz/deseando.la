#!/bin/sh
set -e

# Ruta donde Nginx sirve los archivos
WWW=/usr/share/nginx/html

# Variables de entorno con defaults
: "${DIRECTUS_URL:=}"
: "${DIRECTUS_TOKEN:=}"

# Generar config.js desde la plantilla
if [ -f "${WWW}/config.js.template" ]; then
  echo ">> Generando /config.js desde variables de entorno…"
  sed \
    -e "s|\${DIRECTUS_URL}|${DIRECTUS_URL}|g" \
    -e "s|\${DIRECTUS_TOKEN}|${DIRECTUS_TOKEN}|g" \
    "${WWW}/config.js.template" > "${WWW}/config.js"
else
  echo ">> No se encontró ${WWW}/config.js.template"
fi

# Lanzar Nginx
nginx -g "daemon off;"
