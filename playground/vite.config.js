import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@watermarkify/vue-watermark': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  plugins: [vue(), WindiCSS()],
  base: 'vue-watermark',
})
