/// <reference types="vite/client" />
import type { ElementInfo } from 'element-source';

// What element-source resolves a DOM node to: the library's ElementInfo plus a flag saying whether
// anything was resolved, or a message explaining why nothing was.
type ElementSourceResult = (ElementInfo & { available: boolean }) | { error: string };

interface ElementSourceApi {
  ready: boolean;
  error: string | null;
  resolve: (node: unknown) => Promise<ElementSourceResult>;
  resolveBySelector: (selector: string) => Promise<ElementSourceResult>;
  resolveAtPoint: (x: number, y: number) => Promise<ElementSourceResult>;
  formatStack: (stack: unknown, maxLines?: number) => string;
}

declare global {
  interface Window {
    // Read by bitsocial-react-hooks when it creates the default account.
    defaultPkcOptions?: Record<string, unknown>;
    Buffer: typeof import('buffer').Buffer;
    process: NodeJS.Process;
    global: Window;
    // Dev-only tooling; profiling sessions set this flag before navigation.
    __PROFILING__?: boolean;
    __ELEMENT_SOURCE__?: ElementSourceApi;
  }
}

export {};
