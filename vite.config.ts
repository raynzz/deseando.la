import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // Definir variables de entorno para el cliente
  define: {
    'import.meta.env.VITE_DIRECTUS_URL': JSON.stringify('https://hoztlat-deseandola.6vlrrp.easypanel.host'),
    'import.meta.env.VITE_DIRECTUS_TOKEN': JSON.stringify('8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh'),
  },
})