// Node built-ins that pkc-js expects in the browser, as in 5chan.
import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;
window.global = window;
window.process.env = window.process.env || {};

if (typeof window.crypto?.getRandomValues !== 'function') {
  throw new Error('crypto.getRandomValues is required for account keys and signatures.');
}
