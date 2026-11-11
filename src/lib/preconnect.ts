// Opens connections (DNS, TLS) to a host before anything is requested from it, once per origin per page.
const connected = new Set<string>();

export const preconnect = (url: string) => {
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return;
  }
  if (connected.has(origin)) return;
  connected.add(origin);
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};
