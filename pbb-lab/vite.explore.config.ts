import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 plugins: [react()],
 define: { 'process.env.NODE_ENV': JSON.stringify('production') },
 // The dev gateway also builds this private library inside a development process.
 oxc: { jsx: { development: false } },
 resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
 build: { outDir: '.private-explore', emptyOutDir: true, sourcemap: false,
  lib: { entry: fileURLToPath(new URL('./private/explore-entry.tsx', import.meta.url)), formats: ['iife'], name: 'PrivateExplore', cssFileName: 'style', fileName: () => 'explore.js' },
  cssCodeSplit: false,
 },
});
