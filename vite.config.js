import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    resolve: {
      alias: {
        '@cerdas/shell': fileURLToPath(new URL('../cerdas-studio-portal/src/shell/src/index.js', import.meta.url)),
      },
    },
    plugins: [
      svelte(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      strictPort: true,
    }
  }
})
