import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

const proxyHeaders: ProxyOptions['configure'] = (proxy) => {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.setHeader('User-Agent', 'midterm-board/1.0')
    proxyReq.setHeader('Accept', '*/*')
  })
}

const proxy = {
  '/api/gamma': {
    target: 'https://gamma-api.polymarket.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/gamma/, ''),
    configure: proxyHeaders,
  },
  '/api/earlyvote': {
    target: 'https://election.lab.ufl.edu',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/earlyvote/, ''),
    configure: proxyHeaders,
  },
}

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, proxy },
  preview: { host: true, port: 4173, proxy },
})
