# Guía de Despliegue para Deseandola

## Configuración de Variables de Entorno

Para que la aplicación se conecte correctamente a Directus en producción, necesitas configurar las siguientes variables de entorno:

### Variables Requeridas
- `VITE_DIRECTUS_URL`: URL de tu instancia de Directus
- `VITE_DIRECTUS_TOKEN`: Token de autenticación de Directus
- `VITE_APP_VERSION`: Versión de la aplicación (opcional)
- `VITE_BUILD_TIME`: Fecha y hora del build (opcional)
- `VITE_GIT_COMMIT`: Hash del commit (opcional)

### Valores Correctos
```
VITE_DIRECTUS_URL=https://hoztlat-regalos.6vlrrp.easypanel.host
VITE_DIRECTUS_TOKEN=8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh
VITE_APP_VERSION=1.0.X
VITE_BUILD_TIME=2024-XX-XX XX:XX:XX
VITE_GIT_COMMIT=abcdef1234567890
```

### URLs de Despliegue
- **Frontend**: `https://hoztlat-deseandola.6vlrrp.easypanel.host/`
- **Backend/Directus**: `https://hoztlat-regalos.6vlrrp.easypanel.host`

## Despliegue con GitHub Actions

### 1. Configurar Secrets en GitHub
Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions y añade:

- `DOCKER_USERNAME`: Tu usuario de Docker Hub
- `DOCKER_PASSWORD`: Tu contraseña o token de Docker Hub
- `VITE_DIRECTUS_URL`: `https://hoztlat-regalos.6vlrrp.easypanel.host`
- `VITE_DIRECTUS_TOKEN`: `8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh`

### 2. Activar el Workflow
El workflow en `.github/workflows/docker.yml` se ejecutará automáticamente cuando hagas push a la rama `main`.

## Despliegue Local con Docker

### Opción 1: Usando docker-compose (Recomendado)
1. Crea un archivo `.env` con las variables:
```bash
VITE_DIRECTUS_URL=https://hoztlat-regalos.6vlrrp.easypanel.host
VITE_DIRECTUS_TOKEN=8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh
VITE_APP_VERSION=1.0.0
VITE_BUILD_TIME=$(date '+%Y-%m-%d %H:%M:%S')
VITE_GIT_COMMIT=local
```

2. Ejecuta:
```bash
docker-compose up --build
```

### Opción 2: Usando Docker directamente
```bash
docker build \
  --build-arg VITE_DIRECTUS_URL=https://hoztlat-regalos.6vlrrp.easypanel.host \
  --build-arg VITE_DIRECTUS_TOKEN=8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh \
  --build-arg VITE_APP_VERSION=1.0.0 \
  --build-arg VITE_BUILD_TIME="$(date '+%Y-%m-%d %H:%M:%S')" \
  --build-arg VITE_GIT_COMMIT=local \
  -t deseandola .

docker run -p 3000:80 deseandola
```

## Verificación del Despliegue

Una vez desplegado, verifica que:

1. La aplicación carga sin errores de conexión
2. En la consola del navegador aparece:
   ```
   🔗 Configuración Directus: { 
     DIRECTUS_URL: "https://hoztlat-regalos.6vlrrp.easypanel.host", 
     DIRECTUS_TOKEN: "***" 
   }
   ```
3. La lista de deseos se muestra correctamente
4. No hay errores 404 en la consola

## Solución de Problemas

### Si ves errores 404:
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que la URL sea `hoztlat-regalos.6vlrrp.easypanel.host` (no `hoztlat-deseandola`)
- Reconstruye la imagen Docker con las variables correctas

### Si la aplicación no carga:
- Verifica que el puerto 3000 esté disponible
- Revisa los logs del contenedor: `docker logs <container_id>`

## Importante
- Nunca expongas el token de Directus en el cliente
- Las variables de entorno deben configurarse en el entorno de producción, no hardcodearse
- **Frontend URL**: `https://hoztlat-deseandola.6vlrrp.easypanel.host/`
- **Backend URL**: `https://hoztlat-regalos.6vlrrp.easypanel.host`
- El footer mostrará ambas URLs para referencia clara
- El footer mostrará información de versión, build y commit para verificar despliegues
- Cada vez que actualices en EasyPanel, verás nueva información en el footer