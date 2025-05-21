import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'ColorGrabbr'

// https://vite.dev/config/
export default defineConfig({

  plugins: [react()],
  base: './'
})
