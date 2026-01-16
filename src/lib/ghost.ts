import GhostContentAPI from '@tryghost/content-api';

export const ghostClient = new GhostContentAPI({
  url: 'https://trade90.ghost.io', 
  key: import.meta.env.GHOST_CONTENT_API_KEY,
  version: 'v5.0',
});
