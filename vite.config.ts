import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [basicSsl()],
  root: '.',
  publicDir: 'assets',
  build: mode === 'lib'
    ? {
        lib: {
          entry: resolve(__dirname, 'src/embed/mount.ts'),
          name: 'PSEVR',
          formats: ['es', 'umd'],
          fileName: (format: string) => `pse-vr.${format === 'es' ? 'mjs' : 'js'}`,
        },
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes('@babylonjs')) return 'babylon';
            },
          },
        },
        outDir: 'dist-embed',
        sourcemap: true,
      }
    : {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes('@babylonjs')) return 'babylon';
            },
          },
        },
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
}));
