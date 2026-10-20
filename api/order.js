// POST /api/order : vérifie la commande, recalcule le total et crée une session Stripe Checkout.
// La boutique encaisse toujours la totalité en ligne. Les e-mails partent quand Stripe confirme le paiement (webhook).
import { env, json, readBody, buildOrder, toMetadata, stripe, siteUrl, checkPromo, ensureCoupon, normPhone } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST uniquement' });
  const body = await readBody(req);
  if (body.website) return json(res, 200, { ok: true, code: 'OMD-OK' }); // champ piège anti-robots

  const { errors, order } = buildOrder(body.order);
  if (errors.length) return json(res, 400, { error: errors[0], errors });

  if (!env.stripeKey) return json(res, 503, { error: 'Paiement en ligne indisponible pour le moment' });
  let promo = null;
  if (order.promo) {
    promo = await checkPromo(order.promo, order.phone, order.email);
    if (!promo.ok) return json(res, 400, { error: promo.error, field: 'promo' });
    order.discount = Math.round(order.total * promo.percent / 100);
    order.paid = order.total - order.discount;
  }
  const base = siteUrl(req);
  const lineItems = order.lines.map(l => ({ quantity: l.qty, price_data: { currency: 'eur', unit_amount: l.unit, product_data: {
    name: l.name.slice(0, 120), ...(l.opts ? { description: l.opts.slice(0, 300) } : {}), ...(l.img ? { images: [`${env.assetUrl}/mail-${l.img}.jpg`] } : {}) } } }));
  const params = {
    mode: 'payment',
    locale: 'fr',
    customer_email: order.email,
    client_reference_id: order.code,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 45,
    success_url: `${base}/?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/?paiement=annule`,
    metadata: toMetadata(order),
    custom_text: { submit: { message: `Retrait ${order.pickup} au 19 rue des Capucins, Reims. Produits frais : pas de droit de rétractation.` } },
    payment_intent_data: { description: `Oh My Donut ${order.code} · retrait ${order.pickup}`, metadata: { order_code: order.code, phone: normPhone(order.phone), email: order.email, promo: order.promo || '' } }
  };
  params.line_items = lineItems;
  try {
    if (promo) { await ensureCoupon(promo.code, promo.percent); params.discounts = [{ coupon: promo.code }]; }
  } catch (e) { return json(res, 502, { error: 'Code promo indisponible pour le moment', field: 'promo' }); }
  try {
    const session = await stripe('POST', '/checkout/sessions', params);
    return json(res, 200, { ok: true, url: session.url, code: order.code });
  } catch (e) {
    return json(res, 502, { error: 'Stripe a refusé la demande', detail: String(e.message || e) });
  }
}
