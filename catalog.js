/* =========================================================
   CATALOGUE OH MY DONUT : SOURCE UNIQUE DES PRODUITS ET DES PRIX
   Utilisé par le site (navigateur) ET par le serveur (calcul des
   montants Stripe). Modifier un prix ici suffit.
   Ne garder que du JSON valide entre les deux balises.
   ========================================================= */
window.CATALOG = /*JSON*/{
 "version": 1,
 "currency": "eur",
 "softs": [
  "Coca Zéro",
  "Fanta Orange",
  "Fanta Fraise Kiwi",
  "Mirinda Orange",
  "7 Up",
  "Pepsi Mangue",
  "Fuze Tea",
  "Dada Cherry",
  "Dada Lychee",
  "Dada Melon",
  "Dada Citron vert menthe",
  "Dada Cola",
  "Dada Pêche",
  "Dada Mangue",
  "Dada Fraise",
  "Dr Pepper Cherry",
  "Kinza Cola",
  "Kinza Lemon"
 ],
 "boxSizes": [
  {
   "n": 4,
   "price": 12,
   "cols": 2
  },
  {
   "n": 8,
   "price": 24,
   "cols": 4
  },
  {
   "n": 12,
   "price": 35,
   "cols": 4
  }
 ],
 "products": [
  {
   "id": "bueno-white",
   "cat": "donuts",
   "tier": "premium",
   "name": "Bueno White",
   "desc": "Nappage chocolat blanc, éclats de noisettes et morceau de Bueno White.",
   "fill": "Crème de Bueno",
   "price": 3.5,
   "best": true,
   "img": "donut-bueno-white.webp"
  },
  {
   "id": "kinder-country",
   "cat": "donuts",
   "tier": "premium",
   "name": "Kinder Country",
   "desc": "Nappage chocolat au lait, céréales de blé soufflé et morceaux de Kinder Country.",
   "fill": "",
   "price": 3.5,
   "best": true,
   "img": "donut-kinder-country.webp"
  },
  {
   "id": "pistache",
   "cat": "donuts",
   "tier": "premium",
   "name": "Pistache chocolat blanc",
   "desc": "Nappage chocolat blanc et éclats de pistaches.",
   "fill": "Crème de pistache",
   "price": 3.9,
   "best": true,
   "img": "donut-pistache.webp"
  },
  {
   "id": "speculos",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Spéculos",
   "desc": "Nappage chocolat blanc parsemé de Spéculos.",
   "fill": "Spéculos",
   "price": 3.5,
   "best": true,
   "img": "donut-speculos.webp"
  },
  {
   "id": "oreo",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Oreo",
   "desc": "Nappage vanille sous une montagne d’éclats d’Oreo, filet de chocolat blanc.",
   "price": 3.5,
   "best": true,
   "img": "donut-oreo.webp"
  },
  {
   "id": "mms",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "M&M’s Nutella",
   "desc": "Nappage chocolat au lait et éclats de M&M’s.",
   "fill": "Nutella",
   "price": 3.5,
   "best": true,
   "img": "donut-mms.webp"
  },
  {
   "id": "fraise",
   "cat": "donuts",
   "tier": "classique",
   "name": "Homer Fraise",
   "desc": "Nappage fraise et vermicelles multicolores. Le classique qu’on adore.",
   "fill": "",
   "price": 3.5,
   "best": true,
   "img": "donut-fraise.webp"
  },
  {
   "id": "biscuit-rose-reims",
   "cat": "donuts",
   "tier": "premium",
   "name": "Biscuit de Reims",
   "desc": "Nappage vanille et poudre de biscuit rose de Reims, avec le biscuit posé dessus.",
   "fill": "Framboise",
   "price": 3.5,
   "tag": "sig",
   "img": "donut-biscuit-rose-reims.webp"
  },
  {
   "id": "cafe",
   "cat": "donuts",
   "tier": "classique",
   "name": "Café",
   "desc": "Nappage au café et généreux vermicelles chocolat.",
   "fill": "",
   "price": 3.5,
   "tag": "new",
   "img": "donut-cafe.webp"
  },
  {
   "id": "cafe-speculos",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Café Spéculos",
   "desc": "Nappage café brillant et couronne de crumble de spéculoos.",
   "price": 3.5,
   "tag": "new",
   "img": "donut-cafe-speculos.webp"
  },
  {
   "id": "maxi-oreo-bounty",
   "cat": "donuts",
   "tier": "premium",
   "name": "Maxi Oreo Bounty",
   "desc": "Le format maxi : nappage chocolat blanc coco et éclats d’Oreo.",
   "fill": "Crème de Bounty",
   "price": 4,
   "tag": "maxi",
   "img": "donut-maxi-oreo-bounty.webp"
  },
  {
   "id": "bounty",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Bounty",
   "desc": "Nappage chocolat blanc coco et filet de chocolat.",
   "fill": "Crème de Bounty maison",
   "price": 3.5,
   "img": "donut-bounty.webp"
  },
  {
   "id": "bueno-lait",
   "cat": "donuts",
   "tier": "premium",
   "name": "Bueno",
   "desc": "Nappage chocolat au lait, éclats de noisettes et morceau de Bueno.",
   "fill": "Crème de Bueno",
   "price": 3.5,
   "img": "donut-bueno-lait.webp"
  },
  {
   "id": "nutella-bready",
   "cat": "donuts",
   "tier": "premium",
   "name": "Nutella B-ready",
   "desc": "Nappage Nutella parsemé d’éclats de B-ready.",
   "fill": "Nutella",
   "price": 3.5,
   "img": "donut-nutella-bready.webp"
  },
  {
   "id": "pistache-nutella",
   "cat": "donuts",
   "tier": "premium",
   "name": "Pistache Nutella",
   "desc": "Nappage pistache parsemé d’éclats de pistache.",
   "fill": "Nutella",
   "price": 3.5,
   "img": "donut-pistache-nutella.webp"
  },
  {
   "id": "cookie-nutella",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Cookie Nutella",
   "desc": "Nappage chocolat au lait et éclats de granola.",
   "fill": "Nutella",
   "price": 3.5,
   "img": "donut-cookie-nutella.webp"
  },
  {
   "id": "kitkat",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Kit Kat",
   "desc": "Nappage chocolat au lait parsemé d’éclats de Kit Kat.",
   "fill": "Chocolat au lait",
   "price": 3.5,
   "img": "donut-kitkat.webp"
  },
  {
   "id": "lion",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Lion Caramel",
   "desc": "Nappage chocolat au lait parsemé d’éclats de biscuits Lion.",
   "fill": "Caramel",
   "price": 3.5,
   "img": "donut-lion.webp"
  },
  {
   "id": "daim",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Daim",
   "desc": "Nappage chocolat au lait parsemé de Daim.",
   "fill": "Caramel",
   "price": 3.5,
   "img": "donut-daim.webp"
  },
  {
   "id": "speculos-caramel",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Spéculos Caramel Beurre Salé",
   "desc": "Nappage chocolat blanc et éclats de spéculos.",
   "fill": "Caramel beurre salé",
   "price": 3.5,
   "img": "donut-speculos-caramel.webp"
  },
  {
   "id": "citron-meringue",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Citron meringué",
   "desc": "Nappage citron et meringues sur le dessus.",
   "fill": "Citron",
   "price": 3.5,
   "img": "donut-citron-meringue.webp"
  },
  {
   "id": "framboise-chocolat-blanc",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Framboise chocolat blanc",
   "desc": "Nappage chocolat blanc, copeaux blancs et éclats de framboise.",
   "fill": "Framboise",
   "price": 3.5,
   "img": "donut-framboise-chocolat-blanc.webp"
  },
  {
   "id": "fruits-rouges",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Fruits rouges",
   "desc": "Nappé de 5 fruits rouges : fraise, framboise, myrtille, mûre et cassis.",
   "fill": "5 fruits rouges",
   "price": 3.5,
   "img": "donut-fruits-rouges.webp"
  },
  {
   "id": "pralines-amande-pistache",
   "cat": "donuts",
   "tier": "premium",
   "name": "Pralinés Amande Pistache",
   "desc": "Pralines roses concassées et généreux filet pistache.",
   "price": 3.5,
   "img": "donut-pralines-amande-pistache.webp"
  },
  {
   "id": "smarties",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Smarties",
   "desc": "Nappage chocolat au lait parsemé de Smarties.",
   "fill": "",
   "price": 3.5,
   "img": "donut-smarties.webp"
  },
  {
   "id": "tagada",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Tagada",
   "desc": "Nappage fraise et bonbons Tagada.",
   "price": 3.5,
   "img": "donut-tagada.webp"
  },
  {
   "id": "marshmallow-chocolat",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Marshmallow chocolat",
   "desc": "Nappage chocolat au lait et mini marshmallows.",
   "fill": "",
   "price": 3.5,
   "img": "donut-marshmallow-chocolat.webp"
  },
  {
   "id": "marshmallow-fraise",
   "cat": "donuts",
   "tier": "gourmand",
   "name": "Marshmallow fraise",
   "desc": "Nappage fraise parsemé de marshmallows.",
   "fill": "",
   "price": 3.5,
   "img": "donut-marshmallow-fraise.webp"
  },
  {
   "id": "chocolat-lait",
   "cat": "donuts",
   "tier": "classique",
   "name": "Chocolat au lait",
   "desc": "Nappage chocolat au lait et vermicelles chocolat.",
   "fill": "",
   "price": 3.5,
   "img": "donut-chocolat-lait.webp"
  },
  {
   "id": "chocolat-blanc",
   "cat": "donuts",
   "tier": "classique",
   "name": "Chocolat blanc",
   "desc": "Nappage chocolat blanc parsemé de copeaux de chocolat blanc.",
   "fill": "",
   "price": 3.5,
   "img": "donut-chocolat-blanc.webp"
  },
  {
   "id": "nature-sucre",
   "cat": "donuts",
   "tier": "classique",
   "name": "Nature au sucre",
   "desc": "Glaçage au sucre, tout simple, moelleux et fondant.",
   "fill": "",
   "price": 2.5,
   "img": "donut-nature-sucre.webp"
  },
  {
   "id": "muffin-pistache",
   "cat": "muffins",
   "name": "Muffin Pistache",
   "desc": "Muffin moelleux au cœur fondant à la pistache.",
   "price": 3.5,
   "img": "muffin-pistache.webp",
   "noCut": true
  },
  {
   "id": "muffin-chocolat-noir",
   "cat": "muffins",
   "name": "Muffin Chocolat Noir",
   "desc": "Muffin moelleux au cœur fondant au chocolat noir.",
   "price": 3.5,
   "img": "muffin-chocolat-noir.webp",
   "noCut": true
  },
  {
   "id": "brookie",
   "cat": "muffins",
   "name": "Brookie",
   "desc": "Fond de tarte cookie et brownie fondant, avec éclats de noisette.",
   "price": 3.5,
   "img": "donut-brookie.webp"
  },
  {
   "id": "cookie-matcha",
   "cat": "muffins",
   "name": "Cookie Matcha",
   "desc": "Cookie au matcha et pépites de chocolat blanc.",
   "price": 3,
   "img": "cookie-matcha.webp",
   "noCut": true
  },
  {
   "id": "b-bubble",
   "cat": "boissons",
   "name": "Bubble tea",
   "desc": "Thé glacé et perles, parfum au choix.",
   "price": 5.5,
   "img": "drink-bubble-tea.webp",
   "noCut": true,
   "options": [
    {
     "label": "Parfum",
     "choices": [
      "Lait classique",
      "Taro",
      "Fraise",
      "Mangue",
      "Matcha"
     ]
    },
    {
     "label": "Perles",
     "choices": [
      "Tapioca",
      "Popping fraise",
      "Popping mangue"
     ]
    }
   ]
  },
  {
   "id": "b-milkshake",
   "cat": "boissons",
   "name": "Milkshake",
   "desc": "Milkshake à composer, avec chantilly.",
   "price": 5,
   "img": "drink-milkshake.webp",
   "noCut": true,
   "options": [
    {
     "label": "Parfum",
     "choices": [
      "Vanille",
      "Fraise",
      "Chocolat",
      "Spéculos",
      "Caramel beurre salé",
      "Oreo"
     ]
    }
   ]
  },
  {
   "id": "b-smoothie-fr",
   "cat": "boissons",
   "name": "Smoothie Fruits Rouges",
   "desc": "Cerise, banane, fraise et cassis.",
   "price": 5,
   "img": "drink-smoothie-fruits-rouges.webp",
   "noCut": true
  },
  {
   "id": "b-smoothie-detox",
   "cat": "boissons",
   "name": "Smoothie Détox",
   "desc": "Mangue, orange, papaye, coco, gingembre et curcuma.",
   "price": 5,
   "img": "drink-smoothie-detox.webp",
   "noCut": true
  },
  {
   "id": "b-smoothie-exo",
   "cat": "boissons",
   "name": "Smoothie Exotique",
   "desc": "Fruit du dragon, mangue, banane, pomme et myrtille.",
   "price": 5,
   "img": "drink-smoothie-exotique.webp",
   "noCut": true
  },
  {
   "id": "b-canette",
   "cat": "boissons",
   "name": "Canette fraîche",
   "desc": "Coca Zéro, Fanta, 7 Up, Pepsi Mangue, Fuze Tea, Dada, Kinza…",
   "price": 2,
   "art": {
    "kind": "cup",
    "liquid": "#E5384F"
   },
   "options": [
    {
     "label": "Ta canette",
     "choices": "SOFTS"
    }
   ]
  },
  {
   "id": "b-matcha",
   "cat": "boissons",
   "name": "Matcha latte",
   "desc": "Matcha et lait, chaud ou glacé.",
   "price": 4.5,
   "art": {
    "kind": "cup",
    "liquid": "#9CC46A"
   },
   "options": [
    {
     "label": "Service",
     "choices": [
      "Glacé",
      "Chaud"
     ]
    }
   ]
  },
  {
   "id": "b-gourmand",
   "cat": "boissons",
   "name": "Café gourmand",
   "desc": "Un café et ses mini gourmandises.",
   "price": 5.5,
   "art": {
    "kind": "mug",
    "liquid": "#3B1E12"
   }
  },
  {
   "id": "b-cappu",
   "cat": "boissons",
   "name": "Cappuccino",
   "desc": "Expresso, lait mousseux, cacao.",
   "price": 3,
   "art": {
    "kind": "mug",
    "liquid": "#C8946A",
    "foam": true
   }
  },
  {
   "id": "b-expresso",
   "cat": "boissons",
   "name": "Expresso",
   "desc": "Le petit plaisir à petit prix.",
   "price": 1,
   "art": {
    "kind": "mug",
    "liquid": "#2A140C",
    "small": true
   }
  },
  {
   "id": "f-etudiant",
   "cat": "formules",
   "name": "Offre étudiante",
   "desc": "1 donut + 1 boisson fraîche. Carte étudiante au retrait.",
   "price": 5,
   "art": {
    "kind": "combo",
    "a": "fraise",
    "b": "soft"
   },
   "options": [
    {
     "label": "Ton donut",
     "choices": "DONUTS"
    },
    {
     "label": "Ta boisson",
     "choices": "SOFTS"
    }
   ]
  },
  {
   "id": "f-petitdej",
   "cat": "formules",
   "name": "Petit déjeuner",
   "desc": "Donut, cookie ou muffin + un café chaud. Retrait jusqu’à 11h.",
   "price": 5,
   "until": 660,
   "art": {
    "kind": "combo",
    "a": "nature-sucre",
    "b": "mug"
   },
   "options": [
    {
     "label": "Ta gourmandise",
     "choices": [
      "Donut nature au sucre",
      "Cookie Matcha",
      "Muffin Chocolat Noir"
     ]
    },
    {
     "label": "Ton café",
     "choices": [
      "Expresso",
      "Café allongé",
      "Cappuccino"
     ]
    }
   ]
  }
 ],
 "settings": {
  "maxDaysAhead": 30,
  "eventMinDays": 2,
  "leadMinutes": 20,
  "lastPickupBeforeClose": 15,
  "hours": {
   "0": [
    13,
    20
   ],
   "1": [
    10,
    22
   ],
   "2": [
    10,
    22
   ],
   "3": [
    10,
    22
   ],
   "4": [
    10,
    22
   ],
   "5": [
    10,
    22
   ],
   "6": [
    10,
    22
   ]
  },
  "shop": {
   "name": "Oh My Donut",
   "address": "19 rue des Capucins, 51100 Reims",
   "phone": "06 47 69 82 09",
   "email": "ohmydonut51@gmail.com"
  },
  "promos": {
   "BIENVENUE10": {
    "percent": 10,
    "firstOrder": true,
    "label": "−10 % sur ta 1re commande"
   }
  }
 }
}/*END*/;
