import GhostContentAPI from '@tryghost/content-api';

// Use environment variables, or a empty string to prevent the "Missing URL" crash
const url = import.meta.env.GHOST_API_URL || 'https://tradeninety.ghost.io';
const key = import.meta.env.GHOST_CONTENT_API_KEY || '';

export const ghostClient = new GhostContentAPI({
  url: url,
  key: key,
  version: 'v5.0',
});
