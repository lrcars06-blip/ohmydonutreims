// POST /api/stripe-webhook : appelé par Stripe quand un paiement aboutit.
// Vérifie la signature, puis envoie les e-mails (boutique + client) et le WhatsApp.
import { env, json, readRaw, verifyStripeSignature, fromMetadata, notifyAll, payLabel, applySession } from './_lib.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST uniquement' });
  const raw = await readRaw(req);
  if (!verifyStripeSignature(raw, req.headers['stripe-signature'], env.stripeWebhookSecret)) return json(res, 400, { error: 'Signature invalide' });
  let event; try { event = JSON.parse(raw.toString('utf8')); } catch { return json(res, 400, { error: 'JSON invalide' }); }

  const okTypes = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
  if (!okTypes.includes(event.type)) return json(res, 200, { received: true, ignored: event.type });
  const s = event.data.object;
  if (s.payment_status !== 'paid') return json(res, 200, { received: true, pending: true });

  const order = fromMetadata(s.metadata || {});
  if (!order) return json(res, 200, { received: true, error: 'commande illisible' });
  order.payStatus = 'payé';
  applySession(order, s);
  if (!order.email && s.customer_details?.email) order.email = s.customer_details.email;
  const headline = order.mode === 'event' ? '🎉 Réservation payée' : '🍩 Commande payée';
  const sent = await notifyAll(order, headline, s.id);
  return json(res, 200, { received: true, sent, pay: payLabel(order) });
}
