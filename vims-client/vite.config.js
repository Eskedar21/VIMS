import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Use relative base for Electron, absolute for web deployment
  // Vercel will use '/' automatically, Electron needs './'
  base: process.env.VERCEL ? '/' : './',

  build: {
    outDir: 'dist',
    assetsDir: process.env.VERCEL ? 'assets' : '.', // Use assets folder for web, root for Electron
    chunkSizeWarningLimit: 1500,
  }
});