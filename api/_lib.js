// =========================================================
// Oh My Donut : fonctions partagées par les routes /api
// (les fichiers qui commencent par "_" ne sont pas exposés)
// =========================================================
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

// ---------- Catalogue : source unique des prix ----------
let CATALOG;
export function catalog() {
  if (CATALOG) return CATALOG;
  const src = readFileSync(join(process.cwd(), 'catalog.js'), 'utf8');
  const a = src.indexOf('/*JSON*/') + 8, b = src.indexOf('/*END*/');
  CATALOG = JSON.parse(src.slice(a, b));
  return CATALOG;
}

// ---------- Configuration (variables d'environnement Vercel) ----------
export const env = {
  stripeKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  resendKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'Oh My Donut <onboarding@resend.dev>',
  shopEmail: process.env.SHOP_EMAIL || 'ohmydonut51@gmail.com',
  callmebotKey: process.env.CALLMEBOT_KEY || '',
  callmebotPhone: process.env.CALLMEBOT_PHONE || '33647698209',
  siteUrl: (process.env.SITE_URL || '').replace(/\/$/, ''),
  assetUrl: (process.env.SITE_URL || 'https://ohmydonut51.vercel.app').replace(/\/$/, '')
};

export function siteUrl(req) {
  if (env.siteUrl) return env.siteUrl;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

// ---------- Petites aides ----------
export const euro = c => (c / 100).toFixed(2).replace('.', ',') + ' €';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await readRaw(req);
  try { return JSON.parse(raw.toString('utf8') || '{}'); } catch { return {}; }
}
export function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function newCode(prefix) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(5);
  let c = ''; for (const b of bytes) c += alphabet[b % alphabet.length];
  return `${prefix}-${c}`;
}

// ---------- Date / créneau (heure de Paris) ----------
function parisToday() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}
function addDays(iso, n) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function pickupLabel(date, time) {
  const t = parisToday();
  if (date === t) return `aujourd’hui à ${time}`;
  if (date === addDays(t, 1)) return `demain à ${time}`;
  const d = new Date(date + 'T12:00:00Z');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) + ` à ${time}`;
}

// ---------- Validation + calcul serveur (on ne fait jamais confiance aux prix du navigateur) ----------
export function buildOrder(input) {
  const C = catalog(), S = C.settings;
  const byId = Object.fromEntries(C.products.map(p => [p.id, p]));
  const o = input || {};
  const errors = [];

  const name = clip(o.name, 60);
  const phone = clip(o.phone, 20);
  const email = clip(o.email, 120).toLowerCase();
  const note = clip(o.note, 500);
  const promo = clip(o.promo, 30).toUpperCase().replace(/\s+/g, '');
  const mode = o.mode === 'event' ? 'event' : 'collect';
  const pay = 'full'; // la boutique encaisse toujours la totalité en ligne
  if (!name) errors.push('Prénom manquant');
  if (!/^(?:\+33|0033|0)[1-9]\d{8}$/.test(phone.replace(/[\s.\-]/g, ''))) errors.push('Téléphone invalide');
  if (!email) errors.push('E-mail obligatoire');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('E-mail invalide');
  if (o.consent !== true) errors.push('Conditions non acceptées');

  // date / heure
  const date = String(o.date || ''), time = String(o.time || '');
  const today = parisToday();
  const min = mode === 'event' ? addDays(today, S.eventMinDays) : today;
  const max = addDays(today, S.maxDaysAhead);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < min || date > max) errors.push('Date de retrait invalide');
  if (!/^\d{2}h\d{2}$/.test(time)) errors.push('Heure de retrait invalide');
  else {
    const dow = new Date(date + 'T12:00:00Z').getUTCDay();
    const [op, cl] = S.hours[String(dow)] || [10, 22];
    const mins = (+time.slice(0, 2)) * 60 + (+time.slice(3));
    if (mins < op * 60 || mins > cl * 60 - S.lastPickupBeforeClose) errors.push('Heure hors des horaires d’ouverture');
  }

  // lignes
  const lines = [];
  const raw = Array.isArray(o.lines) ? o.lines.slice(0, 60) : [];
  for (const l of raw) {
    const qty = Math.max(1, Math.min(50, parseInt(l.qty, 10) || 1));
    if (Array.isArray(l.box)) {
      const size = C.boxSizes.find(b => b.n === l.box.length);
      if (!size || !l.box.every(id => byId[id] && byId[id].cat === 'donuts')) { errors.push('Box invalide'); continue; }
      const counts = {}; l.box.forEach(id => counts[byId[id].name] = (counts[byId[id].name] || 0) + 1);
      lines.push({ name: `Box de ${size.n} donuts`, opts: Object.entries(counts).map(([n, c]) => `${c} ${n}`).join(', '), qty, unit: Math.round(size.price * 100), img: 'logo-emblem' });
    } else {
      const p = byId[l.id];
      if (!p) { errors.push('Produit inconnu'); continue; }
      if (p.until && mode === 'collect' && (+time.slice(0, 2)) * 60 + (+time.slice(3)) > p.until) errors.push(`${p.name} : retrait avant ${Math.floor(p.until / 60)}h`);
      lines.push({ name: p.name, opts: clip(l.opts, 200), qty, unit: Math.round(p.price * 100), img: p.img ? p.img.replace(/\.\w+$/, '') : 'logo-emblem' });
    }
  }
  if (!lines.length) errors.push('Panier vide');

  const total = lines.reduce((s, l) => s + l.unit * l.qty, 0);

  const ev = o.event || {};
  const event = mode === 'event' ? {
    type: clip(ev.type, 40) || 'Anniversaire', who: clip(ev.who, 60), age: clip(ev.age, 4), guests: clip(ev.guests, 5), msg: clip(ev.msg, 200)
  } : null;

  return {
    errors,
    order: {
      code: newCode(mode === 'event' ? 'EVT' : 'OMD'),
      name, phone, email, note, mode, date, time, pickup: pickupLabel(date, time),
      pay, total, toPay: total, promo, discount: 0, paid: total,
      payStatus: 'en attente de paiement',
      event, lines, createdAt: new Date().toISOString()
    }
  };
}

export function payLabel(o) {
  const amt = euro(o.paid ?? o.total);
  return (o.payStatus === 'payé' ? `Payée en ligne (${amt})` : `En attente de paiement (${amt})`) + (o.discount ? `, code ${o.promo} −${euro(o.discount)}` : '');
}

// ---------- Codes promo ----------
export const normPhone = p => { const d = String(p || '').replace(/[^\d+]/g, '').replace(/^0033/, '+33').replace(/^0/, '+33'); return d; };
const q = v => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
async function alreadyOrdered(field, value) {
  const query = `status:'succeeded' AND metadata['${field}']:'${q(value)}'`;
  const r = await stripe('GET', `/payment_intents/search?limit=1&query=${encodeURIComponent(query)}`);
  return (r.data || []).length > 0;
}
// Vérifie un code. Renvoie { ok, code, percent, label } ou { ok:false, error }
export async function checkPromo(code, phone, email) {
  code = String(code || '').toUpperCase().replace(/\s+/g, '');
  const def = (catalog().settings.promos || {})[code];
  if (!def) return { ok: false, error: 'Ce code promo n’existe pas' };
  if (def.firstOrder) {
    if (!env.stripeKey) return { ok: false, error: 'Code promo indisponible pour le moment' };
    const ph = normPhone(phone), em = String(email || '').trim().toLowerCase();
    if (!/^\+33[1-9]\d{8}$/.test(ph) || !em) return { ok: false, error: 'Renseigne ton téléphone et ton e-mail pour utiliser ce code' };
    try {
      const [a, b] = await Promise.all([alreadyOrdered('phone', ph), alreadyOrdered('email', em)]);
      if (a || b) return { ok: false, error: `Le code ${code} est réservé à la première commande` };
    } catch { return { ok: false, error: 'Code promo indisponible pour le moment, réessaie dans un instant' }; }
  }
  return { ok: true, code, percent: def.percent, label: def.label || `−${def.percent} %` };
}
// Crée le coupon Stripe correspondant s'il n'existe pas encore (id = code)
export async function ensureCoupon(code, percent) {
  try { return await stripe('GET', `/coupons/${encodeURIComponent(code)}`); }
  catch { return stripe('POST', '/coupons', { id: code, percent_off: percent, duration: 'once', name: `${code} (−${percent} %)` }); }
}
// Montants réels encaissés par Stripe (remise comprise)
export function applySession(order, s) {
  if (!order || !s) return order;
  if (typeof s.amount_total === 'number') order.paid = s.amount_total;
  if (s.total_details && typeof s.total_details.amount_discount === 'number') order.discount = s.total_details.amount_discount;
  return order;
}

// ---------- Commande <-> métadonnées Stripe (50 clés x 500 caractères max) ----------
export function toMetadata(o) {
  const compact = JSON.stringify(o);
  const md = { order_code: o.code, pay: o.pay };
  for (let i = 0, k = 0; i < compact.length && k < 40; i += 490, k++) md[`o${k}`] = compact.slice(i, i + 490);
  return md;
}
export function fromMetadata(md) {
  let s = ''; for (let k = 0; md[`o${k}`] !== undefined; k++) s += md[`o${k}`];
  try { return JSON.parse(s); } catch { return null; }
}

// ---------- Stripe (API REST, sans dépendance) ----------
function form(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}
export async function stripe(method, path, params) {
  const r = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : form(params || {})
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `Stripe ${r.status}`);
  return j;
}
export function verifyStripeSignature(raw, header, secret, tolerance = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')).filter(x => x.length === 2).map(([a, b]) => [a.trim(), b.trim()]));
  const sigs = header.split(',').filter(p => p.trim().startsWith('v1=')).map(p => p.trim().slice(3));
  const t = parts.t;
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > tolerance) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${raw.toString('utf8')}`).digest('hex');
  return sigs.some(s => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

// ---------- E-mails (Resend) ----------
export async function sendMail({ to, subject, html, replyTo, idempotencyKey }) {
  if (!env.resendKey) return { ok: false, skipped: true };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendKey}`, 'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey.slice(0, 250) } : {})
    },
    body: JSON.stringify({ from: env.mailFrom, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) })
  });
  return { ok: r.ok, status: r.status };
}

export async function sendWhatsApp(text) {
  if (!env.callmebotKey) return { ok: false, skipped: true };
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${env.callmebotPhone}&apikey=${encodeURIComponent(env.callmebotKey)}&text=${encodeURIComponent(text)}`;
    const r = await fetch(url); return { ok: r.ok };
  } catch { return { ok: false }; }
}

function eventText(o) {
  const e = o.event; if (!e) return '';
  return [e.type, e.who && `pour ${e.who}`, e.age && `${e.age} ans`, e.guests && `${e.guests} personnes`].filter(Boolean).join(', ') + (e.msg ? `. Message : ${e.msg}` : '');
}

export function orderText(o, headline) {
  return `${headline}\nCommande ${o.code}\n${o.name} (${o.phone})${o.email ? `\n${o.email}` : ''}\nRetrait ${o.pickup}\n` +
    (o.event ? `${eventText(o)}\n` : '') + '\n' +
    o.lines.map(l => `${l.qty} x ${l.name}${l.opts ? ` (${l.opts})` : ''}`).join('\n') +
    `\n\nTotal ${euro(o.paid ?? o.total)}\nPaiement : ${payLabel(o)}` + (o.note ? `\nNote : ${o.note}` : '');
}

// ---------- Modèles d'e-mails (DA du site : bordeaux, rose, chocolat, crème) ----------
const C_ = { bord: '#5B1426', bordDeep: '#3E0C19', pink: '#EC4C8A', pinkSoft: '#FDEEF3', pinkMid: '#FAD6E3', choco: '#4A2418', chocoSoft: '#7A4A36', cream: '#FBF7F3', line: '#F1DDE3' };
const FONT = "'Baloo 2','Trebuchet MS',Arial,Helvetica,sans-serif";
const SCRIPT = "'Kaushan Script','Brush Script MT',cursive";
const img = name => `${env.assetUrl}/${name}`;
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Oh+My+Donut+19+rue+des+Capucins+51100+Reims';

function shell(title, inner, preheader = '') {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${esc(title)}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Kaushan+Script&display=swap');@media (max-width:600px){.px{padding-left:18px!important;padding-right:18px!important}.big{font-size:26px!important}}</style></head>
<body style="margin:0;padding:0;background:${C_.pinkSoft};font-family:${FONT};color:${C_.choco};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C_.pinkSoft};padding:24px 10px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(91,20,38,.12)">
<tr><td align="center" style="background:${C_.bord};padding:22px 20px 18px"><a href="${env.assetUrl}" style="text-decoration:none"><img src="${img('logo-email.png')}" width="300" alt="Oh My Donut" style="display:block;width:300px;max-width:80%;height:auto;border:0;margin:0 auto"></a></td></tr>
<tr><td style="background:${C_.pink};height:6px;line-height:6px;font-size:0">&nbsp;</td></tr>
<tr><td class="px" style="padding:28px 32px 8px">
<h1 class="big" style="margin:0 0 6px;font-family:${SCRIPT};font-weight:400;font-size:32px;line-height:1.15;color:${C_.bord}">${esc(title)}</h1>
${inner}
</td></tr>
<tr><td class="px" style="padding:8px 32px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C_.cream};border-radius:16px"><tr><td style="padding:14px 16px;font-size:13px;line-height:1.55;color:${C_.chocoSoft}">
<b style="color:${C_.choco}">Oh My Donut</b> · 19 rue des Capucins, 51100 Reims<br>
<a href="tel:+33647698209" style="color:${C_.bord};font-weight:700;text-decoration:none">06 47 69 82 09</a> · Lun–sam 10h–22h · Dim 13h–20h<br>
<a href="${MAPS}" style="color:${C_.pink};font-weight:700">Itinéraire</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/ohmydonut51/" style="color:${C_.pink};font-weight:700">Instagram</a> &nbsp;·&nbsp; <a href="${env.assetUrl}/#legal-cgv" style="color:${C_.chocoSoft}">CGV</a>
</td></tr></table>
</td></tr>
<tr><td align="center" style="background:${C_.bordDeep};color:${C_.pinkMid};padding:12px 20px;font-size:11px;line-height:1.5">SCOTT ET LAÏKA, SAS au capital de 1 000 € · RCS Reims 108 567 801<br>Produits frais : pas de droit de rétractation (art. L221-28 du Code de la consommation).</td></tr>
</table></td></tr></table></body></html>`;
}

function orderTable(o) {
  const rows = o.lines.map(l => `<tr>
<td width="64" style="padding:10px 12px 10px 0;border-bottom:1px solid ${C_.line};vertical-align:middle"><img src="${img(`mail-${l.img || 'logo-emblem'}.jpg`)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border-radius:14px;border:0"></td>
<td style="padding:10px 0;border-bottom:1px solid ${C_.line};vertical-align:middle;font-size:15px;line-height:1.35"><b style="color:${C_.choco}">${esc(l.name)}</b>${l.qty > 1 ? ` <span style="background:${C_.pinkMid};color:${C_.bord};border-radius:99px;padding:1px 8px;font-size:12px;font-weight:800">×${l.qty}</span>` : ''}${l.opts ? `<br><span style="font-size:12.5px;color:${C_.chocoSoft}">${esc(l.opts)}</span>` : ''}</td>
<td style="padding:10px 0 10px 10px;border-bottom:1px solid ${C_.line};text-align:right;white-space:nowrap;vertical-align:middle;font-size:15px;font-weight:700;color:${C_.choco}">${euro(l.unit * l.qty)}</td></tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
${o.discount ? `<tr><td></td><td style="padding:12px 0 2px;font-size:14px;color:${C_.chocoSoft}">Sous-total</td><td style="padding:12px 0 2px;text-align:right;font-size:14px;color:${C_.chocoSoft};white-space:nowrap">${euro(o.total)}</td></tr>
<tr><td></td><td style="padding:2px 0;font-size:14px;color:${C_.pink};font-weight:700">🎁 Code ${esc(o.promo)}</td><td style="padding:2px 0;text-align:right;font-size:14px;color:${C_.pink};font-weight:700;white-space:nowrap">−${euro(o.discount)}</td></tr>` : ''}
<tr><td></td><td style="padding:14px 0 4px;font-size:16px;font-weight:800;color:${C_.bord}">Total payé</td><td style="padding:14px 0 4px;text-align:right;font-size:20px;font-weight:800;color:${C_.bord};white-space:nowrap">${euro(o.paid ?? o.total)}</td></tr></table>`;
}

function codeCard(o, sub) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 18px"><tr><td align="center" style="background:${C_.pinkMid};border-radius:20px;padding:18px 16px">
<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:${C_.bord}">Numéro de commande</div>
<div class="big" style="font-size:30px;font-weight:800;color:${C_.pink};letter-spacing:.04em;margin:4px 0 8px">${esc(o.code)}</div>
<div style="display:inline-block;background:${C_.bord};color:#fff;border-radius:999px;padding:7px 16px;font-size:14px;font-weight:700">🕒 ${esc(o.pickup)}</div>
${sub ? `<div style="font-size:13px;color:${C_.chocoSoft};margin-top:10px">${sub}</div>` : ''}
</td></tr></table>`;
}

export function shopEmail(o, headline) {
  const tel = o.phone.replace(/[\s.\-]/g, '');
  const info = [
    ['Type', o.mode === 'event' ? '🎉 Anniversaire / événement' : '🛍️ Click & collect'],
    ['Client', `<b>${esc(o.name)}</b>`],
    ['Téléphone', `<a href="tel:${esc(tel)}" style="color:${C_.bord};font-weight:700">${esc(o.phone)}</a>`],
    ['E-mail', `<a href="mailto:${esc(o.email)}" style="color:${C_.bord}">${esc(o.email)}</a>`],
    o.event ? ['Événement', esc(eventText(o))] : null,
    ['Paiement', `<span style="background:#DDF5E5;color:#1E6B3A;border-radius:99px;padding:2px 10px;font-weight:800">${esc(payLabel(o))}</span>`]
  ].filter(Boolean).map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:${C_.chocoSoft};white-space:nowrap;vertical-align:top;font-size:13px">${k}</td><td style="padding:6px 0;font-size:15px;color:${C_.choco}">${v}</td></tr>`).join('');
  const note = o.note ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr><td style="background:#FFF1F1;border-left:5px solid #C0263B;border-radius:12px;padding:12px 14px;font-size:14px;color:#8A1C2B"><b>⚠️ Note / allergies :</b> ${esc(o.note)}</td></tr></table>` : '';
  return shell(headline, `<p style="margin:0;font-size:15px;color:${C_.chocoSoft}">Préparer pour le retrait ci-dessous. Le client donnera ce numéro au comptoir.</p>
${codeCard(o)}${note}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${info}</table>
${orderTable(o)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 8px"><tr><td style="background:${C_.pink};border-radius:999px"><a href="tel:${esc(tel)}" style="display:inline-block;padding:12px 22px;color:#fff;font-weight:800;font-size:15px;text-decoration:none">📞 Appeler ${esc(o.name)}</a></td></tr></table>`,
  `${o.code} · ${o.pickup} · ${euro(o.paid ?? o.total)}`);
}

export function customerEmail(o) {
  const ev = o.mode === 'event';
  const intro = ev ? `Merci ${esc(o.name)} ! Ta réservation est payée et bien enregistrée. On te rappelle très vite pour caler les derniers détails de ta fête.`
    : `Merci ${esc(o.name)} ! Ta commande est payée et nos donuts sont entre de bonnes mains. On la prépare pour ton créneau.`;
  const steps = [
    ['1', 'Viens à l’heure choisie', '19 rue des Capucins, Reims'],
    ['2', 'Donne ton numéro', `<b style="color:${C_.pink}">${esc(o.code)}</b> au comptoir`],
    ['3', 'Savoure', 'Rien à payer sur place 🍩']
  ].map(([n, t, d]) => `<td width="33%" valign="top" style="padding:0 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:${C_.cream};border-radius:16px;padding:14px 8px">
<div style="display:inline-block;width:30px;height:30px;line-height:30px;border-radius:50%;background:${C_.bord};color:#fff;font-weight:800;font-size:15px">${n}</div>
<div style="font-size:13.5px;font-weight:800;color:${C_.choco};margin-top:8px;line-height:1.25">${t}</div><div style="font-size:12px;color:${C_.chocoSoft};margin-top:3px;line-height:1.35">${d}</div></td></tr></table></td>`).join('');
  const inner = `<p style="margin:0;font-size:16px;line-height:1.55;color:${C_.choco}">${intro}</p>
${codeCard(o, `Paiement reçu : <b style="color:${C_.bord}">${euro(o.paid ?? o.total)}</b> ✓${o.discount ? ` (code ${esc(o.promo)} −${euro(o.discount)})` : ''}`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr>${steps}</tr></table>
<div style="font-family:${SCRIPT};font-size:24px;color:${C_.bord};margin:0 0 4px">Ta commande</div>
${orderTable(o)}
${o.note ? `<p style="font-size:13px;color:${C_.chocoSoft};margin:12px 0 0"><b>Ta note :</b> ${esc(o.note)}</p>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 10px"><tr><td style="background:${C_.pink};border-radius:999px"><a href="${MAPS}" style="display:inline-block;padding:13px 24px;color:#fff;font-weight:800;font-size:15px;text-decoration:none">📍 Itinéraire vers la boutique</a></td></tr></table>
<p style="font-size:13px;color:${C_.chocoSoft};line-height:1.55;margin:10px 0 6px">Allergie ou intolérance ? Appelle-nous au <a href="tel:+33647698209" style="color:${C_.bord};font-weight:700">06 47 69 82 09</a> avant le retrait : nos donuts sont préparés dans un atelier où sont présents des allergènes majeurs (gluten, œufs, lait, soja, fruits à coque…).</p>`;
  return shell(ev ? 'Ta fête est réservée !' : 'Commande confirmée !', inner, `${o.code} · retrait ${o.pickup} · ${euro(o.paid ?? o.total)} payés`);
}

export async function notifyAll(o, headline, idemBase) {
  const jobs = [
    sendMail({ to: env.shopEmail, subject: `${headline} ${o.code} · ${o.pickup}`, html: shopEmail(o, headline), replyTo: o.email || undefined, idempotencyKey: idemBase && `${idemBase}-shop` }),
    sendWhatsApp(orderText(o, headline))
  ];
  if (o.email) jobs.push(sendMail({ to: o.email, subject: `🍩 Oh My Donut : ${o.mode === 'event' ? 'réservation' : 'commande'} ${o.code} confirmée (retrait ${o.pickup})`, html: customerEmail(o), replyTo: env.shopEmail, idempotencyKey: idemBase && `${idemBase}-client` }));
  const [shop, wa, client] = await Promise.all(jobs.map(p => p.catch(() => ({ ok: false }))));
  return { shop: !!shop?.ok, whatsapp: !!wa?.ok, client: client ? !!client.ok : null };
}
