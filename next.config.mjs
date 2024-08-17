import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public', // This is where the service worker and other PWA assets will be stored
  // Other PWA configurations
});

export default {
  ...nextConfig,
  async headers() {
    return [
      {
        source: '/api/socket', // The route where the WebSocket API is available
        headers: [
          {
            key: 'Connection',
            value: 'upgrade', // Ensures proper handling of WebSocket connections
          },
          {
            key: 'Upgrade',
            value: 'websocket',
          },
        ],
      },
    ];
  },
};



