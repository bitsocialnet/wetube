/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const srcPath = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// pkc-js runs in the browser and still imports Node built-ins; these aliases and defines match 5chan's.
export default defineConfig({
  // Relative asset paths so the static build also works from an IPFS gateway path.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // bitsocial-react-hooks passes zustand v4's deprecated default `shallow` as an equality fn,
      // which logs a warning on every call. The shim keeps the comparison without the warning.
      'zustand/shallow': srcPath('lib/zustand-shallow-shim.ts'),
      'node-fetch': 'isomorphic-fetch',
      assert: 'assert',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      events: 'events',
      process: 'process',
      'node:buffer': 'buffer',
      'node:crypto': 'crypto-browserify',
      'node:events': 'events',
      'node:process': 'process',
      'node:stream': 'stream-browserify',
      'node:util': 'util/',
      'util/': 'util/',
      util: 'util/',
    },
  },
  server: {
    port: 5180,
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    target: 'esnext',
  },
  optimizeDeps: {
    entries: ['index.html'],
    include: ['ethers', 'assert', 'buffer', 'process', 'util', 'stream-browserify', 'isomorphic-fetch'],
  },
  define: {
    'process.version': JSON.stringify(''),
    global: 'globalThis',
    __dirname: '""',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
