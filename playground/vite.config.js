import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@watermarkify/vue-watermark': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  plugins: [vue()],
  base: 'vue-watermark',
})
