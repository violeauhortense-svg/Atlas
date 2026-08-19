# 🚀 Quick Reference - Atlas AI (1 Page)

## 📊 Qu'est-ce qu'Atlas?

**Système d'orchestration automatisée de produits** qui transforme une idée en produit lancé en **35 minutes** avec **99% d'automatisation**.

```
Idée → Claude (conseil) → Vous validez → CEO orchestre → Agents travaillent → Graphify affiche
```

---

## 🎯 Utilisation Complète (4 étapes)

### 1️⃣ CRÉER (2 min)
**URL:** https://atlas-1-mu.vercel.app → "Créer un produit"

Remplissez:
- Nom du produit
- Description
- Utilisateurs cibles
- Problème résolu

### 2️⃣ AFFINER (20 min)
**Section:** "💬 Affiner le projet avec Claude"

Posez 5-10 questions:
- "Quel est mon marché?"
- "Comment me différencier?"
- "Quel MVP?"
- Etc.

Claude répond + propose actions

### 3️⃣ VALIDER (10 min)
**Section:** "📋 Actions à Valider"

Pour chaque action:
1. Lisez-la
2. Ajoutez feedback (optionnel)
3. Cliquez **"✅ Approuver"**

Besoin: Min 3 actions approuvées

### 4️⃣ ORCHESTRER (1 min)
**Bouton:** "🚀 Lancer CEO" (devient vert après validations)

CEO crée automatiquement:
- 4-7 agents spécialisés
- Plan 30 jours
- Orchestration intelligente

**Résultat:** Graphify affiche tous les agents! 🎉

---

## 🎮 Les 5 Sections Principales

| Section | Rôle | Durée |
|---------|------|-------|
| **ProductPage** | Vue d'ensemble + bouton CEO | - |
| **ProjectRefinement** | Chat avec Claude | 20 min |
| **ValidationPanel** | Approuver/rejeter actions | 10 min |
| **AgentGraph (Graphify)** | Voir agents en temps réel | Continu |
| **Chat Persistant** | Historique sauvegardé | - |

---

## 🗂️ Architecture Rapide

```
FRONTEND (React)          →  BACKEND (API Routes)  →  DATABASE (Supabase)
├─ ProductPage                ├─ /chat                ├─ projects
├─ ProjectRefinement          ├─ /actions             ├─ agents
├─ ValidationPanel            ├─ /agents              ├─ chat_messages
├─ AgentGraph                 └─ /orchestrate         └─ agent_actions
└─ Navbar
                         ↓
                    Claude (LLM)
```

---

## 🔄 Flux Détaillé

```
VOUS                          BACKEND                   SUPABASE
Créer produit    ──POST──→    /projects    ──INSERT──→  projects
Poser question   ──POST──→    /chat        ──↔──→      Claude
Claude répond                 Crée action  ──INSERT──→  agent_actions
Valider action   ──PATCH──→   /actions     ──UPDATE──→  agent_actions
Lancer CEO       ──POST──→    /orchestrate ──INSERT──→  agents
                              (CEO crée)
Graphify observe ──GET──→     /agents      ──SELECT──→  agents + actions
(chaque 5 sec)
```

---

## ✅ Checklist de Workflow

```
□ Produit créé
  └─ Nom, description, users, problème

□ 5-10 questions posées à Claude
  └─ Actions proposées générées

□ 3-5 actions validées
  └─ Status = "approved"
  └─ Feedback optionnel

□ Bouton CEO est VERT
  └─ Affiche "✅ N actions approuvées"

□ CEO lancé
  └─ Alert: "CEO a lancé orchestration"

□ Graphify affiche agents
  └─ 🟢 Actifs | ✅ Complétés | 🔴 Bloqués
```

---

## 📈 Timeline Idéal

| Temps | Action | Résultat |
|-------|--------|----------|
| 0-2 min | Créer produit | Produit en DB |
| 2-22 min | Affiner Claude | 5-10 actions proposées |
| 22-32 min | Valider actions | 3-5 actions approuvées |
| 32-33 min | Lancer CEO | Agents créés |
| 33-40 min | Observer Graphify | Plan 30 jours visible |

**TOTAL: 35-40 minutes** ✅

---

## 🎨 Statuts Graphify

```
🟢 ACTIVE       = Agent travaille
✅ COMPLETED    = Agent a fini
🔴 BLOCKED      = Agent en attente
⚫ IDLE         = Pas encore lancé
```

Statut = basé sur **nombre d'actions validées**!

---

## 🔐 Setup Unique (Une Fois)

**Clé Claude:**
```
https://console.anthropic.com/account/keys
→ Copier clé (sk-ant-...)
→ Mettre dans .env.local
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-...
```

**Supabase SQL:**
```
https://supabase.com/dashboard
→ SQL Editor
→ Exécuter supabase.sql
```

**Vercel:** ✅ Déjà déployé!

---

## 💻 Commandes Utiles

```bash
npm run dev              # Développement local
npm run build            # Build production
vercel deploy --prod     # Deploy Vercel
supabase link --project-ref XXX  # Lier Supabase
```

---

## 🐛 Déboguer (Quick)

| Problème | Solution |
|----------|----------|
| Claude ne répond pas | Clé API invalide → Vérifier console.anthropic.com |
| Bouton CEO gris | 0 action validée → Approuver min 3 actions |
| Agents n'apparaissent pas | Tables manquantes → Exécuter supabase.sql |
| Graphify vide | CEO pas lancé → Cliquer "Lancer CEO" d'abord |

---

## 📱 URLs Clés

```
App:             https://atlas-1-mu.vercel.app
GitHub:          https://github.com/violeauhortense-svg/Atlas
Supabase:        https://supabase.com/dashboard
Vercel:          https://vercel.com/contact-3101s-projects/atlas-1
Claude API:      https://console.anthropic.com/account/keys
```

---

## 🎯 Métriques

| Métrique | Valeur |
|----------|--------|
| Temps création produit | 2 min |
| Temps affinement Claude | 20 min |
| Temps validation actions | 10 min |
| Temps orchestration | 1 min |
| **Total** | **35 min** |
| Agents créés | 4-7 |
| Actions validées | 3-5 |
| Phases couvertes | 1-5 |
| Temps économisé | **99%** 🚀 |

---

## 📚 Documentation Complète

1. **QUICK-START.md** — Setup (5 min)
2. **SYSTEM-FLOW.md** — Flux utilisateur (15 min)
3. **ARCHITECTURE.md** — Architecture technique
4. **GRAPHIFY-INTEGRATION.md** — Visualisation temps réel
5. **APPLICATION-ANALYSIS.md** — Analyse complète (ce guide)
6. **QUICK-REFERENCE.md** — Cette page (1 min)

---

## 🚀 Go Live Checklist

- ✅ Clé Claude configurée
- ✅ Supabase SQL exécuté
- ✅ Vercel déployé
- ✅ App accessible
- ✅ Test produit créé
- ✅ Claude répond
- ✅ Actions validables
- ✅ CEO se lance
- ✅ Graphify affiche agents

**PRÊT À DÉCOLLER!** 🎉

---

## 💡 Pro Tips

1. **Première question:** "Résumez mon produit" → Claude valide compréhension
2. **Questions clés:** Poser 5-7 questions stratégiques (marché, concurrence, pricing)
3. **Validation:** Approuver 3-5 actions MINIMUM
4. **Feedback:** Ajouter feedback sur décisions clés
5. **Observation:** Regarder Graphify changer chaque 5 sec

---

## ⏰ Temps par Section

```
Créer:               ⏱️  2 min
Affiner (Claude):    ⏱️  20 min  (5-10 questions)
Valider (Actions):   ⏱️  10 min  (3-5 actions)
Orchestrer (CEO):    ⏱️  1 min   (1 click)
Observer (Graphify): ⏱️  5 min   (progression agents)
─────────────────────────────────
TOTAL:              ⏱️  35-40 min  ✅

= 1 produit lancé en < 1 heure!
```

---

## 🎓 Learning Path

**Pour démarrer (5 min):**
→ QUICK-START.md

**Pour bien utiliser (30 min):**
→ SYSTEM-FLOW.md + QUICK-REFERENCE.md

**Pour comprendre complètement (2h):**
→ Tous les docs + explorer l'app

---

## 🎯 Cas d'Utilisation

### Affinage Rapide (30 min)
```
Créer → 3-4 questions Claude → Valider 3 actions → CEO lance
```

### Affinage Profond (2-3h)
```
Créer → 15+ questions Claude → Valider 5-7 actions → CEO lance → Itérer
```

### Itération Continue
```
CEO lancé → Continuer Claude → Valider actions → Agents s'adaptent
```

---

## ✨ Ce Qui le Rend Spécial

| Aspect | Valeur |
|--------|--------|
| **Intelligence** | Claude Anthropic (Opus 5) |
| **Automatisation** | 99% orchestration |
| **Temps** | 35 min vs 40-80h |
| **Validation** | Vous controlez chaque décision |
| **Visualisation** | Graphify temps réel |
| **Adaptation** | Basé sur VOS décisions |
| **Persistance** | Tout sauvegardé (Supabase) |
| **Scalabilité** | 1 produit → N produits |

---

## 🚀 Prêt?

1. Aller à **https://atlas-1-mu.vercel.app**
2. Cliquer **"Créer un produit"**
3. Remplir infos produit
4. Suivre ce guide pas à pas
5. **Voir la magie se faire!** ✨

---

**Merci d'utiliser Atlas AI!** 🙏

Questions? → Consultez les docs complètes
Bug? → Check QUICK-START.md → Dépannage

Bonne orchestration! 🎯
