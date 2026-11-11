// Pure peer-to-peer browser mode, the same defaults 5chan ships: libp2p runs in the page and HTTP
// routers only point it at peers. No gateway or RPC sits between the viewer and a channel.
const HTTP_ROUTER_URLS = [
  'https://peers.pleb.bot',
  'https://routing.lol',
  'https://peers.forumindex.com',
  'https://peers.plebpubsub.xyz',
  'https://routerofbitsocial.xyz',
  'https://bsotracker.online',
];

export const configurePkcOptions = () => {
  window.defaultPkcOptions = {
    ...window.defaultPkcOptions,
    libp2pJsClientsOptions: [{ key: 'libp2pjs' }],
    ipfsGatewayUrls: undefined,
    kuboRpcClientsOptions: undefined,
    pubsubHttpClientsOptions: undefined,
    pubsubKuboRpcClientsOptions: undefined,
    httpRoutersOptions: [...HTTP_ROUTER_URLS],
  };
};
