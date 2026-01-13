import GhostContentAPI from '@tryghost/content-api';

// This logic automatically strips any accidental trailing slashes
const rawUrl = import.meta.env.GHOST_API_URL || 'https://tradeninety.ghost.io';
const cleanUrl = rawUrl.replace(/\/+$/, ''); // This is the "Surgical Fix"

export const ghostClient = new GhostContentAPI({
  url: cleanUrl,
  key: import.meta.env.GHOST_CONTENT_API_KEY || '',
  version: 'v5.0',
});
