# Atlas Produits - Setup Complet

## 🚀 Vue d'ensemble

C'est une plateforme multi-produits digitaux complète que tu peux gérer entièrement depuis ton téléphone.

**Fonctionnalités :**
- ✅ Dashboard admin pour gérer tes produits
- ✅ Système de paiement Stripe intégré
- ✅ Suivi des commandes en temps réel
- ✅ Interface mobile-friendly
- ✅ Déploiement automatique sur Vercel

---

## 📋 Étapes du Setup

### 1️⃣ Configurer Supabase

**Aller à:** https://supabase.com

1. Connecte-toi à ton projet Supabase
2. Va dans **SQL Editor** → **New Query**
3. Copie/colle le contenu du fichier `supabase.sql`
4. Clique sur **Run**
5. Récupère les clés :
   - Va dans **Settings → API**
   - Copie `anon public key` et `service_role key`

**Mets à jour `.env.local` :**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clé_anon_ici
SUPABASE_SERVICE_ROLE_KEY=ta_clé_service_role_ici
```

---

### 2️⃣ Configurer Stripe

**Tes clés sont déjà dans `.env.local`**

Vérifie dans Stripe Dashboard :
- Settings → API Keys

---

### 3️⃣ Tester en Local

```bash
cd C:\Users\conta\digital-products
npm run dev
```

Va à : `http://localhost:3000`

Tu devrais voir :
- **Page d'accueil** : Liste de tes produits
- **Dashboard** : Gestion complète

---

### 4️⃣ Connecter GitHub et Déployer sur Vercel

**Initialiser Git :**
```bash
cd C:\Users\conta\digital-products
git init
git add .
git commit -m "Initial commit: Atlas Produits"
```

**Pusher sur GitHub :**
```bash
git remote add origin https://github.com/violeauhortense-svg/Atlas.git
git branch -M main
git push -u origin main
```

**Déployer sur Vercel :**

1. Va à : https://vercel.com
2. Clique sur **New Project**
3. Sélectionne ton repo **Atlas**
4. Configure les **Environment Variables** :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
   STRIPE_SECRET_KEY=... (NOUVELLE CLÉ!)
   ```
5. Clique sur **Deploy**

---

## ⚠️ IMPORTANT - Sécurité des Clés Stripe

**Après que le déploiement sur Vercel soit terminé :**

1. Va dans Stripe Dashboard
2. **Révoque** la clé `sk_live_51QnJxBGC...` (celle partagée)
3. **Génère une nouvelle clé secrète**
4. **Mets à jour** la clé dans Vercel :
   - Vercel → Ton Projet → Settings → Environment Variables
   - Mets à jour `STRIPE_SECRET_KEY` avec la nouvelle clé

---

## 📱 Utiliser depuis ton Téléphone

Une fois déployé sur Vercel :

1. **Page d'accueil** : `https://atlas-produits.vercel.app`
   - Voir tous tes produits
   - Acheter (à venir)

2. **Dashboard Admin** : `https://atlas-produits.vercel.app/dashboard`
   - Créer de nouveaux produits
   - Voir les commandes
   - Stats de vente
   - **Totalement mobile-friendly**

---

## 🎯 Créer un Premier Produit

1. Va dans le Dashboard (`/dashboard`)
2. Clique sur **+ Nouveau Produit**
3. Remplis le formulaire :
   - Nom
   - Description
   - Prix
   - Type (Générateur, Template, etc.)
   - Image (optionnel)
4. Clique sur **Créer le Produit**

Voilà ! Ton produit est en ligne.

---

## 🔄 Ajouter la Fonctionnalité d'Achat

Prochaines étapes (à venir) :
- [ ] Intégrer Stripe Checkout
- [ ] Confirmation du paiement
- [ ] Email automatique après achat
- [ ] Délivraison du produit

---

## 📚 Structure du Projet

```
digital-products/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Page d'accueil
│   │   ├── dashboard/            # Dashboard admin
│   │   └── api/                  # APIs
│   ├── lib/
│   │   ├── supabase.ts           # Accès à la BD
│   │   └── stripe.ts             # Accès à Stripe
│   └── types/
│       └── index.ts              # Types TypeScript
├── .env.local                     # Clés (ne pas commit)
└── supabase.sql                   # Schéma de la BD
```

---

## ❓ FAQ

**Q: Puis-je créer plusieurs produits différents ?**
R: Oui ! Chaque produit peut avoir un type différent. Crée autant de produits que tu veux.

**Q: Comment voir les commandes ?**
R: Dashboard → Commandes Récentes. Auto-refresh toutes les 30 secondes.

**Q: Comment changer un produit ?**
R: Dashboard → Clique sur le produit → (À implémenter)

**Q: Mon téléphone ne voit pas les updates ?**
R: Rafraîchis la page (pull-down sur mobile).

---

## 🚀 Prochaines Étapes

1. ✅ Setup Supabase
2. ✅ Tester en local
3. ✅ Déployer sur Vercel
4. ✅ Créer ton premier produit
5. 🔄 **Implémenter le checkout Stripe** (paiements réels)
6. 🔄 Ajouter les emails automatiques
7. 🔄 Intégrer Paperclip AI pour générer des produits

---

## 💬 Support

Si quelque chose ne marche pas :
1. Vérifie les clés `.env.local`
2. Regarde la console du navigateur (F12)
3. Regarde les logs Vercel

Bon courage ! 🚀
