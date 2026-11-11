/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
// The commit shown in the account menu; empty outside a Git checkout.
const commitRef = (() => {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
})();

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
    include: [
      'ethers',
      'assert',
      'buffer',
      'process',
      'util',
      'stream-browserify',
      'isomorphic-fetch',
      'lucide-react',
      // The dev-only inspectors in src/lib/dev-tools.ts. Discovered late, they were bundled in a second
      // optimizer pass with their own copy of React, which broke Agentation with an invalid hook call.
      'react',
      'react-dom/client',
      'agentation',
      'element-source',
    ],
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    'import.meta.env.VITE_COMMIT_REF': JSON.stringify(commitRef),
    'process.version': JSON.stringify(''),
    global: 'globalThis',
    __dirname: '""',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.js'],
  },
});
