/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: {
      proxy: {
        '/api/amadeus/auth': {
          target: 'https://test.api.amadeus.com',
          changeOrigin: true,
          rewrite: () => '/v1/security/oauth2/token',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const body =
                `grant_type=client_credentials` +
                `&client_id=${env.AMADEUS_API_KEY}` +
                `&client_secret=${env.AMADEUS_API_SECRET}`

              proxyReq.setHeader(
                'Content-Type',
                'application/x-www-form-urlencoded'
              )
              proxyReq.setHeader(
                'Content-Length',
                Buffer.byteLength(body)
              )
              proxyReq.write(body)
            })
          },
        },

        '/api/amadeus/locations': {
          target: 'https://test.api.amadeus.com',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost')
            return `/v1/reference-data/locations${url.search}`
          },
        },

        '/api/amadeus/flights': {
          target: 'https://test.api.amadeus.com',
          changeOrigin: true,
          rewrite: () => '/v2/shopping/flight-offers',
        },
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/index.ts',
          'src/components/ui/'
        ],
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'vendor-react': ['react', 'react-dom', 'react-router'],
            // UI libraries (Radix)
            'vendor-ui': [
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dialog',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              'cmdk',
            ],
            // Charts
            'vendor-charts': ['recharts'],
            // Date utilities
            'vendor-date': ['date-fns', 'react-day-picker'],
            // Data fetching
            'vendor-data': ['@tanstack/react-query', 'axios', 'nuqs', 'zod'],
            // Icons
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  }
})
