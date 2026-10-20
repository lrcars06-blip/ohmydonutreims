// GET /api/order-status?session_id=cs_... : statut d'un paiement Stripe, pour l'écran de retour
import { env, json, stripe, fromMetadata, applySession } from './_lib.js';

export default async function handler(req, res) {
  const id = String(new URL(req.url, 'http://x').searchParams.get('session_id') || '');
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(res, 400, { error: 'session_id invalide' });
  if (!env.stripeKey) return json(res, 503, { error: 'Stripe non configuré' });
  try {
    const s = await stripe('GET', `/checkout/sessions/${id}`);
    const order = fromMetadata(s.metadata || {});
    if (order) applySession(order, s);
    if (order) order.payStatus = s.payment_status === 'paid' ? 'payé' : 'en attente de paiement';
    return json(res, 200, { paid: s.payment_status === 'paid', order });
  } catch (e) {
    return json(res, 502, { error: 'Stripe injoignable' });
  }
}
