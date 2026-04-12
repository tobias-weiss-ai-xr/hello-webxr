import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';

export default defineConfig({
  plugins: [basicSsl()],
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/gui', '@babylonjs/loaders']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: true
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.png', '**/*.jpg']
});
