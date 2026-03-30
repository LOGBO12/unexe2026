import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://unexe.alwaysdata.net',
        changeOrigin: true,
      },
      // Ajout du proxy storage pour les images Laravel
      '/storage': {
        target: 'https://unexe.alwaysdata.net',
        changeOrigin: true,
      },
    }
  }
})