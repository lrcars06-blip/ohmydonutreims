// GET /api/asset?f=cut-xxx.webp | mail-xxx.jpg
// Sert les petites images regroupées dans _assets.json (GitHub limite le dépôt web à 100 fichiers).
// Les adresses publiques restent /cut-*.webp et /mail-*.jpg grâce aux "rewrites" de vercel.json.
import pack from './_assets.json' with { type: 'json' };

const TYPES = { webp: 'image/webp', jpg: 'image/jpeg' };

export default function handler(req, res) {
  const f = String(new URL(req.url, 'http://x').searchParams.get('f') || '');
  const data = Object.prototype.hasOwnProperty.call(pack, f) ? pack[f] : null;
  if (!data) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', TYPES[f.split('.').pop()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  res.end(Buffer.from(data, 'base64'));
}
