import GhostContentAPI from '@tryghost/content-api';

// This is the "Handshake" between Ghost and Astro
export const ghostClient = new GhostContentAPI({
  url: import.meta.env.GHOST_API_URL,
  key: import.meta.env.GHOST_CONTENT_API_KEY,
  version: 'v5.0',
});
