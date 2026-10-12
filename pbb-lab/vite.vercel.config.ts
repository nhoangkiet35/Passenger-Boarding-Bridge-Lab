import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exploreDevGateway } from './build/explore-dev-gateway.mjs';

// The simulator is client-only; Vercel serves the compiled static application.
export default defineConfig({
  plugins: [exploreDevGateway(), react()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  server: {
    watch: { ignored: ['**/dist/**','**/dist-vercel/**','**/.private-explore/**','**/.vercel/**','**/.wrangler/**','**/.vinext/**'] },
  },
  build: { outDir: 'dist-vercel' },
});
