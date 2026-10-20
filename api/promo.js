// POST /api/promo : vérifie un code promo avant le paiement (le serveur revérifie au moment de la commande)
import { json, readBody, checkPromo } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST uniquement' });
  const b = await readBody(req);
  const r = await checkPromo(b.code, b.phone, b.email);
  return json(res, r.ok ? 200 : 400, r);
}
