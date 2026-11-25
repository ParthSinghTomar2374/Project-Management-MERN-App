import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const envParent = loadEnv(mode, path.resolve(__dirname, '..'), 'VITE_')
  const envLocal = loadEnv(mode, __dirname, 'VITE_')
  const mergedEnv = { ...envParent, ...envLocal }

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    define: Object.keys(mergedEnv).reduce((acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(mergedEnv[key]);
      return acc;
    }, {}),
    optimizeDeps: {
      include: ['react-is', 'recharts']
    },
    build: {
      chunkSizeWarningLimit: 1000,
    }
  }
})
