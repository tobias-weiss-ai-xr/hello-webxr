import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@babylonjs')) return 'babylon';
        }
      }
    }
  },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  server: { host: '0.0.0.0', port: 3000 },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.png', '**/*.jpg']
});
