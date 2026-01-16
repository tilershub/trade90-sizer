import GhostContentAPI from '@tryghost/content-api';

// Using the URL you confirmed: trade90.ghost.io
const cleanUrl = 'https://trade90.ghost.io';

export const ghostClient = new GhostContentAPI({
  url: cleanUrl,
  key: import.meta.env.GHOST_CONTENT_API_KEY || '',
  version: 'v5.0',
});
