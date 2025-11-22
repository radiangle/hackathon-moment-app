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
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/claude/, '/v1'),
          secure: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Claude API proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Forward the API key from the request headers
              const apiKey = req.headers['x-api-key'];
              if (apiKey) {
                proxyReq.setHeader('x-api-key', apiKey);
              }
              proxyReq.setHeader('anthropic-version', '2023-06-01');
              // Required header for browser-originated requests through proxy
              proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
            });
          },
        },
      },
    },
  }
})

