# 🏗️ Architecture du Système Feedback Complet

## Vue d'Ensemble Complète

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ATLAS AI VENTURE STUDIO v2.0                    │
│                  Claude → Validation → CEO → Agents                │
└─────────────────────────────────────────────────────────────────────┘

                              UTILISATEUR
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                  PAGE      CHAT CLAUDE    ACTIONS
                 PRODUIT     (Claude)      (Valider)
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   FRONTEND REACT/TS      │
                    │                          │
                    │ • ProductPage            │
                    │ • ProjectRefinement      │
                    │ • ValidationPanel        │
                    │ • AgentGraph             │
                    │ • Navbar                 │
                    └─────────────┬─────────────┘
                                  │ API HTTP/JSON
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
   ┌─────────┐          ┌──────────────┐        ┌─────────────┐
   │   CHAT  │          │   ACTIONS    │        │ ORCHESTRATE │
   │  /chat  │          │   /actions   │        │   /orch      │
   └────┬────┘          └──────┬───────┘        └────┬────────┘
        │                      │                     │
        │   Claude API Call    │   GET/POST/PATCH    │
        │   claude-opus-5      │                     │
        ▼                      ▼                     ▼
   ┌─────────────────────────────────────────────────────┐
   │          BACKEND API - Next.js Routes             │
   │                                                   │
   │  POST /api/projects/[id]/chat                    │
   │  └─ Envoie message à Claude                     │
   │  └─ Parse réponse JSON                          │
   │  └─ Crée action_proposée                        │
   │  └─ Sauvegarde message                          │
   │                                                   │
   │  GET/POST/PATCH /api/projects/[id]/actions      │
   │  └─ Liste actions                               │
   │  └─ Crée action                                 │
   │  └─ Approuve/rejette avec feedback              │
   │                                                   │
   │  POST /api/projects/[id]/orchestrate            │
   │  └─ Récupère actions approuvées                 │
   │  └─ Envoie au Claude (CEO)                      │
   │  └─ Crée agents spécialisés                     │
   │  └─ Sauvegarde plan 30 jours                    │
   │                                                   │
   └─────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌──────────────┐        ┌─────────────┐
   │  SUPABASE DB │        │ ANTHROPIC   │
   │              │        │ Claude API  │
   │ TABLES:      │        │             │
   │ • projects   │        │ Models:     │
   │ • agents     │        │ opus-5      │
   │ • actions    │        │             │
   │ • chat_msgs  │        │ Max tokens  │
   └──────────────┘        │ 4000        │
                           └─────────────┘

                    SUPABASE (Data Persistence)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐           ┌──────────┐         ┌──────────┐
   │PROJECTS │           │ AGENTS   │         │ ACTIONS  │
   │─────────│           │──────────│         │──────────│
   │id       │           │id        │         │id        │
   │name     │           │proj_id   │         │proj_id   │
   │desc     │           │name      │         │title     │
   │status   │           │role      │         │desc      │
   │created  │           │status    │         │status    │
   │updated  │           │tasks     │         │feedback  │
   │         │           │created   │         │type      │
   │         │           │updated   │         │priority  │
   └─────────┘           └──────────┘         └──────────┘

        ┌──────────────────┐
        │ CHAT_MESSAGES    │
        │──────────────────│
        │id               │
        │project_id       │
        │role (user/asst) │
        │message          │
        │thinking (opt)   │
        │created_at       │
        └──────────────────┘
```

---

## Flux Détaillé: De la Question à la Validation

```
ÉTAPE 1: UTILISATEUR POSE UNE QUESTION
┌─────────────────────────────┐
│ ProjectRefinement Component │
│                             │
│ Vous: "Comment me diffé     │
│ rencier des concurrents ?"  │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ POST /api/projects/{id}/chat             │
│                                          │
│ Body: {                                  │
│   message: "Comment me différencier..."  │
│ }                                        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Backend Route Handler                    │
│ (app/api/projects/[id]/chat/route.ts)    │
│                                          │
│ 1. Récupère le message                   │
│ 2. Envoie à Claude Anthropic             │
│ 3. Claude répond (JSON structuré)        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Claude (Anthropic API)                   │
│ Model: claude-opus-5                     │
│                                          │
│ Prompt: "PROJECT DETAILS:                │
│           Name: Produit Test             │
│           Description: ...               │
│                                          │
│           USER FEEDBACK: Comment...      │
│                                          │
│           INSTRUCTIONS: Respond in JSON  │
│           with insight, recs, question"  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Claude Response (JSON)                   │
│                                          │
│ {                                        │
│   "insight": "Vous cachez vos réels...", │
│   "recommendations": [...],              │
│   "criticalQuestion": "Avez-vous...?",   │
│   "proposedAction": {                    │
│     "title": "Identifier early adopters",│
│     "description": "Faire interviews...",│
│     "actionType": "claude_suggestion"    │
│   }                                      │
│ }                                        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Backend                                  │
│ 1. Parse JSON                            │
│ 2. Format réponse (insight + recs)       │
│ 3. Appelle createProposedAction()        │
│ 4. Sauvegarde le message en DB           │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Supabase                                 │
│ 1. INSERT chat_messages (user, assistant)│
│ 2. INSERT agent_actions (proposed)       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Frontend                                 │
│ 1. Affiche réponse formatée              │
│ 2. Référence à l'action proposée         │
│                                          │
│ Affichage:                               │
│ 💡 Insight: Vous cachez vos réels...    │
│ ✅ Recommandations:                      │
│    1. Chercher les early adopters        │
│    2. Faire des interviews micro        │
│    3. Valider la volonté de payer        │
│ ❓ Question: Avez-vous déjà des users?  │
└──────────────┬───────────────────────────┘
               │
               ▼
            PRÊT POUR VALIDATION
```

---

## Flux Détaillé: De la Validation au Lancement du CEO

```
ÉTAPE 2: VALIDATION DE L'ACTION
┌──────────────────────────────┐
│ ValidationPanel Component    │
│                              │
│ Action proposée s'affiche    │
│ Status: ⏳ En attente        │
│                              │
│ Vous lisez et décidez:       │
│ "✅ Approuver + feedback"    │
│                              │
│ Feedback: "Oui, j'ai 5      │
│ utilisateurs prêts"          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ PATCH /api/projects/{id}/actions/{aId}   │
│                                          │
│ Body: {                                  │
│   status: "approved",                    │
│   userFeedback: "Oui, j'ai 5..."         │
│ }                                        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Backend Route Handler                    │
│ (app/api/.../actions/[actionId]/route.ts)│
│                                          │
│ UPDATE agent_actions SET                 │
│   status = 'approved',                   │
│   user_feedback = 'Oui, j\'ai 5...',     │
│   updated_at = NOW()                     │
│ WHERE id = {actionId}                    │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Supabase                                 │
│ Action mise à jour ✅                    │
│ Status: approved                         │
│ Feedback: sauvegardé                     │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ Frontend                                 │
│ 1. Action status = "approved"            │
│ 2. validatedActions count = +1           │
│ 3. Bouton CEO devient vert               │
│ 4. Affiche "✅ 1 action validée"         │
└──────────────┬───────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
REPÉTEZ 2-4 FOIS   ALORS LANCEZ CEO
(3-5 actions)          🚀
                        │
                        ▼
```

---

## Flux Détaillé: Du Lancement du CEO aux Agents

```
ÉTAPE 3: LANCEMENT DU CEO
┌────────────────────────────────┐
│ Utilisateur clique             │
│ "🚀 Lancer CEO"                │
│                                │
│ Bouton est VERT (actions ok)   │
│ Count: ✅ 4 actions validées   │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Frontend Validation                    │
│                                        │
│ 1. Récupère GET /actions               │
│ 2. Compte les approved                 │
│ 3. Si count = 0: alert + return        │
│ 4. Si count > 0: continue              │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ POST /api/projects/{id}/orchestrate    │
│                                        │
│ Body: {                                │
│   validatedActions: 4,                 │
│   fromClaude: true                     │
│ }                                      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Backend Handler                        │
│ (orchestrate/route.ts)                 │
│                                        │
│ 1. Fetch project data                  │
│ 2. Fetch validated actions (WHERE      │
│    status='approved')                  │
│ 3. Build Claude context with actions   │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Claude (CEO Agent)                     │
│ Model: claude-opus-5                   │
│                                        │
│ Prompt: ORCHESTRATION_PROMPT +         │
│ ProductInfo + ValidatedActions         │
│                                        │
│ "You are CEO Agent.                    │
│                                        │
│ Product:                               │
│  Name: Produit Test                    │
│  Description: ...                      │
│                                        │
│ Validated Claude Suggestions:          │
│ - Identifier early adopters: ...       │
│ - Affiner positionnement: ...          │
│ - Valider TAM: ...                     │
│ - Définir MVP: ...                     │
│                                        │
│ Create 30-day orchestration plan."     │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Claude Response                        │
│                                        │
│ Plan 30 jours adaptée à VOS actions:  │
│                                        │
│ PHASE 1 (Jours 1-5): Validation       │
│ - Market Researcher: Interview users  │
│ - Analyser feedback: 80%+ required    │
│                                        │
│ PHASE 2 (Jours 6-10): Architecture    │
│ - Product Architect: Design           │
│ - Tech Lead: Stack                    │
│                                        │
│ [...]                                  │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Backend                                │
│                                        │
│ 1. Créer CEO Agent:                    │
│    INSERT agents (CEO Orchestrator)    │
│                                        │
│ 2. Créer Phase 1 Agents:               │
│    INSERT agents (Market Researcher)   │
│    INSERT agents (Competitive...)      │
│    INSERT agents (Customer Interview)  │
│                                        │
│ 3. Créer Action Items:                 │
│    INSERT agent_actions (Orchest...)   │
│    INSERT agent_actions (Phase 1...)   │
│                                        │
│ 4. Retourner succès                    │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Supabase                               │
│                                        │
│ agents: +1 CEO + 3 Phase 1 agents      │
│ agent_actions: +2 main actions         │
│ chat_messages: Historique sauvegardé   │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Frontend                               │
│                                        │
│ 1. Alert success "CEO a lancé..."      │
│ 2. Appelle fetchProduct()              │
│ 3. Appelle fetchAgents()               │
│ 4. Graphe d'Agents s'actualise         │
│                                        │
│ 🤖 CEO Orchestrator (🟢 ACTIVE)       │
│ ├── Market Researcher (🟢 ACTIVE)    │
│ ├── Competitive Analyst (🟢 ACTIVE)  │
│ └── Customer Interviewer (🟢 ACTIVE) │
└────────────────────────────────────────┘
```

---

## Architecture des Données: Relations

```
PROJECTS
  ├─ id (UUID)
  ├─ name
  ├─ description
  ├─ target_users
  ├─ problem
  ├─ status
  └─ phase
       │
       ├─ 1:N AGENTS
       │   ├─ id (UUID)
       │   ├─ project_id (FK)
       │   ├─ name
       │   ├─ role
       │   ├─ status
       │   └─ tasks (JSON)
       │
       ├─ 1:N CHAT_MESSAGES
       │   ├─ id (UUID)
       │   ├─ project_id (FK)
       │   ├─ role
       │   ├─ message
       │   └─ thinking
       │
       └─ 1:N AGENT_ACTIONS
           ├─ id (UUID)
           ├─ project_id (FK)
           ├─ agent_id (FK nullable)
           ├─ title
           ├─ description
           ├─ action_type (claude_suggestion | ceo_task)
           ├─ status (pending | approved | rejected)
           ├─ priority
           ├─ user_feedback
           └─ details (JSON)
```

---

## Flux de Statuts: Agent Actions

```
PENDING (⏳ En attente)
   │
   ├─ Utilisateur clique "✅ Approuver"
   │  ↓
   └─ APPROVED (✅ Approuvée)
      ↓
      Utilisée par le CEO
      Exécutée par les agents
      (Terminal)

   ├─ Utilisateur clique "❌ Rejeter"
   │  ↓
   └─ REJECTED (❌ Rejetée)
      ↓
      Ignorée par le CEO
      (Terminal)
```

---

## Statuts des Agents

```
⚫ IDLE (En standby)
  ↓ Lancé par CEO
🟢 ACTIVE (Travaille)
  ↓ Termine sa tâche
✅ COMPLETED (Fait)
  ↓ Peut passer le relais
🔴 BLOCKED (Bloqué)
  ↓ En attente de quelque chose
  ↓ Puis continue ou timeout
```

---

## Technologies Stack

```
FRONTEND
├─ React (Next.js 15)
├─ TypeScript
├─ CSS-in-JS (styled-jsx)
└─ Fetch API

BACKEND
├─ Next.js API Routes
├─ TypeScript
└─ Middleware Supabase

DATABASE
├─ Supabase PostgreSQL
├─ Tables: projects, agents, actions, messages
└─ RLS Policies

AI/LLM
├─ Anthropic Claude
├─ Model: claude-opus-5
├─ Max tokens: 2000-4000
└─ System prompts (optimisés)
```

---

## Sécurité & Best Practices

```
✅ FAIT
├─ RLS sur toutes les tables
├─ Validation des inputs
├─ Error handling complet
├─ Logging des erreurs
├─ Feedback utilisateur
└─ Rate limiting (implicite)

⚠️ À CONSIDÉRER
├─ CORS whitelist (prod)
├─ Auth utilisateur (optionnel)
├─ Audit trail complet
├─ Alertes sur API costs
└─ Backup Supabase
```

---

**Diagrammes créés** : 2026-08-19
**Système** : Atlas AI Venture Studio v2.0
