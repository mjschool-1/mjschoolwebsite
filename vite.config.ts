import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function flattenHtmlPlugin() {
  return {
    name: 'flatten-html',
    closeBundle() {
      const rootDir = import.meta.dirname || __dirname;
      const protoIndex = path.resolve(rootDir, 'dist/prototype/index.html');
      const distIndex = path.resolve(rootDir, 'dist/index.html');
      if (fs.existsSync(protoIndex)) {
        fs.copyFileSync(protoIndex, distIndex);
        fs.rmSync(path.dirname(protoIndex), { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/mjschoolwebsite/',
    cacheDir: path.resolve(import.meta.dirname || __dirname, 'node_modules/.vite-standalone'),
    plugins: [react(), tailwindcss(), flattenHtmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || __dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: path.resolve(import.meta.dirname || __dirname, 'prototype/index.html'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
