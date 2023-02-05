import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import resolve from '@rollup/plugin-node-resolve'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      ...resolve({
        preferBuiltins: false,
        browser: true,
      }),
      enforce: 'pre',
      apply: 'build',
    },
  ],
})
