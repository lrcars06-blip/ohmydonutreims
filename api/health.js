// GET /api/health : indique quels services sont configurés (aucune clé n'est jamais renvoyée)
import { env, json, catalog } from './_lib.js';

export default async function handler(req, res) {
  let products = 0; try { products = catalog().products.length; } catch {}
  return json(res, 200, {
    ok: true,
    stripe: !!env.stripeKey,
    stripeMode: /^(sk|rk)_live_/.test(env.stripeKey) ? 'live' : env.stripeKey ? 'test' : null,
    stripeWebhook: !!env.stripeWebhookSecret,
    email: !!env.resendKey,
    emailFrom: env.mailFrom.replace(/.*<|>.*/g, ''),
    whatsapp: !!env.callmebotKey,
    sms: !!env.brevoKey,
    telegram: !!(env.telegramToken && env.telegramChat),
    products
  });
}
