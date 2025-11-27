import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // *** CRITICAL FIX FOR ELECTRON BLANK SCREEN ISSUE ***
  // Sets the base path to relative ('./') instead of absolute ('/')
  // This ensures that assets (JS/CSS/images) load correctly when the
  // index.html file is loaded via the file:// protocol in production.
  base: './',

  build: {
    outDir: 'dist',
    assetsDir: '.', // <-- critical for Electron
    chunkSizeWarningLimit: 1500,
  }
});