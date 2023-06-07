import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// @ts-ignore include file that is outside rootDir
import endpoints from '../config/endpoints.json'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@model': path.resolve(__dirname, '../model'),
      vue: '@vue/compat' // see https://bootstrap-vue.org/vue3
    }
  },
  base: `/${endpoints.SMM}`,
  build: {
    outDir: `../build/${endpoints.SMM}`,
    emptyOutDir: true
  }
})
