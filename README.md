# Oh My Donut Reims

Site de commande en click & collect pour Oh My Donut, 19 rue des Capucins, 51100 Reims.
Paiement en ligne **Stripe**, e-mails de commande **Resend**, hébergement **Vercel**.

Aucune installation, aucun build, aucune dépendance npm. Tous les fichiers sont à la racine, sauf le dossier `api/` (fonctions serveur, obligatoirement dans ce dossier pour Vercel).

---

## Mise en service (30 minutes, à faire une fois)

### 1. Déployer
1. Pousser ce dossier sur un dépôt GitHub (glisser les fichiers + le dossier `api`).
2. Vercel : Add New, Project, importer le dépôt, Framework Preset « Other », Deploy.
3. Adresse du site : `https://ohmydonut51.vercel.app` (ou brancher un nom de domaine dans Settings, Domains).

### 2. Stripe
1. Dashboard Stripe, **Développeurs, Clés API** : copier la **clé secrète** (`sk_live_…`, ou `sk_test_…` pour tester).
2. **Développeurs, Webhooks, Ajouter une destination** :
   - URL : `https://ohmydonut51.vercel.app/api/stripe-webhook`
   - Événements : `checkout.session.completed` et `checkout.session.async_payment_succeeded`
   - Copier le **secret de signature** (`whsec_…`).
3. Paramètres, Moyens de paiement : laisser Carte, Apple Pay, Google Pay activés.
4. Paramètres, Informations publiques de l'entreprise : nom « Oh My Donut », téléphone, e-mail (ils apparaissent sur la page de paiement et les reçus Stripe).

### 3. Resend
1. **API Keys, Create API Key** (permission « Sending access ») : copier la clé `re_…`.
2. **Domains, Add Domain** : ajouter un nom de domaine **dont vous gérez les DNS** (ex. `ohmydonut51.fr`, quelques euros par an ; une adresse `*.vercel.app` ne peut pas être vérifiée) et créer chez le registraire les enregistrements DNS indiqués (SPF, DKIM). Tant que le domaine n'est pas vérifié, Resend n'envoie **qu'à l'adresse du compte Resend** : la boutique reçoit les commandes si le compte Resend a été créé avec ohmydonut51@gmail.com, mais les clients ne reçoivent rien.

### 4. Variables d'environnement Vercel
Settings, Environment Variables (environnement **Production**), puis **Redeploy** :

| Variable | Valeur | Obligatoire |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | oui (paiement en ligne) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | oui (paiement en ligne) |
| `RESEND_API_KEY` | `re_…` | oui (e-mails) |
| `MAIL_FROM` | `Oh My Donut <commandes@VOTRE-DOMAINE>` | oui dès que le domaine est vérifié |
| `SHOP_EMAIL` | `ohmydonut51@gmail.com` | non (valeur par défaut) |
| `SITE_URL` | `https://ohmydonut51.vercel.app` | conseillé (sert aussi aux images des e-mails) |
| `CALLMEBOT_KEY` | clé CallMeBot | non (alerte WhatsApp à la boutique) |

Les clés ne doivent **jamais** être écrites dans un fichier du dépôt.

### 5. Vérifier
1. Ouvrir `https://ohmydonut51.vercel.app/api/health` : `stripe`, `stripeWebhook` et `email` doivent valoir `true`.
2. Sur le site, le panier affiche le bouton « Commander et payer X € » (sinon : « Commander par téléphone », Stripe n'est pas configuré).
3. En mode test (`sk_test_…`), payer avec la carte `4242 4242 4242 4242`, date future, CVC quelconque : retour sur le site avec « Paiement reçu », e-mail « 🍩 Commande payée » à ohmydonut51@gmail.com et e-mail de confirmation au client. Dans Stripe, Webhooks : l'événement doit être en succès (200).
4. Remplacer les clés de test par les clés live, redéployer.

---

## Fonctionnement

**Toute commande est payée en totalité en ligne** (carte, Apple Pay, Google Pay). Pas d'acompte, pas de paiement au retrait.

1. `/api/order` vérifie la commande, recalcule le total et crée une session Stripe Checkout (45 min de validité).
2. Le client paie sur la page Stripe, puis revient sur le site (« Paiement reçu »).
3. Stripe appelle `/api/stripe-webhook` (signature vérifiée), qui envoie :
   - à **ohmydonut51@gmail.com** : « 🍩 Commande payée » avec numéro, créneau, client, note/allergies, détail et photos des produits ;
   - au **client** : « Commande confirmée » aux couleurs du site (logo, numéro, créneau, étapes, détail, itinéraire).
4. Un paiement abandonné ne génère aucune commande ni e-mail.

Les e-mails chargent leurs images depuis le site (`logo-email.png`, `mail-*.jpg`) : elles s'affichent dès que le site est déployé.

### Code promo BIENVENUE10
- −10 % sur la **première commande** payée, vérifié par le serveur : refusé si le téléphone **ou** l'e-mail a déjà une commande payée dans Stripe (recherche sur les métadonnées des paiements).
- Le client saisit le code dans le panier (« Appliquer »). La remise est appliquée par un coupon Stripe `BIENVENUE10` créé automatiquement au premier usage ; le montant réellement encaissé apparaît dans les e-mails.
- Ajouter ou modifier un code : `catalog.js`, `settings.promos` (`percent`, `firstOrder`). Supprimer la ligne désactive le code.
- Limite : sans compte client, un client qui change de téléphone **et** d'e-mail peut réutiliser le code.

**Les prix sont toujours recalculés par le serveur** à partir de `catalog.js` : un client ne peut pas modifier le montant à payer.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Le site : animation, carte, box, événements, panier, créneaux, paiement |
| `catalog.js` | **Carte et prix** (source unique pour le site et le serveur), box, canettes, horaires |
| `api/order.js` | Enregistre une commande, crée le paiement Stripe |
| `api/stripe-webhook.js` | Reçoit la confirmation de paiement de Stripe (signature vérifiée) |
| `api/order-status.js` | Statut du paiement pour l'écran de retour |
| `api/health.js` | Diagnostic de configuration (aucune clé affichée) |
| `api/asset.js`, `api/_assets.json` | Les 73 petites images (`cut-*.webp`, `mail-*.jpg`) regroupées en un seul fichier pour rester sous la limite de 100 fichiers du dépôt GitHub web. Vercel les sert aux mêmes adresses (`/cut-….webp`, `/mail-….jpg`) via les `rewrites` de `vercel.json`. |
| `api/_lib.js` | Calcul des montants, Stripe, Resend, modèles d'e-mails |
| `mentions-legales.html`, `cgv.html`, `confidentialite.html` | Pages légales |
| `404.html` | Page d'erreur |
| `donut-*.webp`, `drink-*.webp`, `muffin-*.webp`, `cookie-matcha.webp`, `event-*.webp` | Photos |
| `logo-email.png` | Logo des e-mails |
| `logo-*.webp`, `favicon-64.png`, `apple-touch-icon.png`, `icon-512.png` | Logo et icônes |
| `hero-boutique.*` | Vidéo de fond de l'accueil |
| `font-*.woff2` | Polices hébergées sur le site (aucune requête vers Google) |
| `vercel.json`, `package.json` | Configuration Vercel |
| `manifest.webmanifest`, `robots.txt`, `sitemap.xml` | Mobile et référencement |

## Modifier la carte ou les prix
Tout est dans `catalog.js` (JSON entre `/*JSON*/` et `/*END*/`) :
- `products` : `name`, `desc`, `fill` (fourrage ; `""` = sans fourrage), `price`, `img`, `best: true` (onglet Best-sellers), `tier` (`classique`, `gourmand`, `premium`), `tag` (`new`, `sig`, `maxi`), `until` (heure limite de retrait en minutes, ex. `660` = 11h).
- `boxSizes` : box de 4 (12 €), 8 (24 €), 12 (35 €).
- `settings` : délais, horaires (`hours`, `"0"` = dimanche).

## À compléter avant la mise en ligne (champs surlignés en jaune)
- Médiateur de la consommation : non renseigné (retiré des CGV à la demande du client). Obligatoire pour la vente en ligne aux particuliers (art. L612-1 du Code de la consommation) : à ajouter dès l'adhésion.
- Numéro de TVA FR16108567801 : calculé à partir du SIREN, à confirmer sur le Kbis ou l'espace professionnel impots.gouv.
- Si un nom de domaine est branché : remplacer `ohmydonut51.vercel.app` dans `index.html`, `robots.txt`, `sitemap.xml` et `SITE_URL`.
