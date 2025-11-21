import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/skyflow': {
          target: env.VITE_SKYFLOW_VAULT_URL || 'https://a370a9658141.vault.skyflowapis-preview.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/skyflow/, ''),
          secure: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Skyflow proxy error', err);
            });
          },
        },
      },
    },
  }
})

