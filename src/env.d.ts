/// <reference types="vite/client" />

declare global {
  interface Window {
    // Read by bitsocial-react-hooks when it creates the default account.
    defaultPkcOptions?: Record<string, unknown>;
    Buffer: typeof import('buffer').Buffer;
    process: NodeJS.Process;
    global: Window;
  }
}

export {};
