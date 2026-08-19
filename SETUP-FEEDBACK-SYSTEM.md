# ⚡ Configuration du Système de Feedback Claude → Validation → CEO

## ✅ Checklist de Configuration (5 minutes)

### 1. Clé Claude API
```bash
# Dans .env.local, mettre à jour :
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-VOTRE_CLE_ICI
```

**Où obtenir une clé ?**
1. https://console.anthropic.com/account/keys
2. Cliquer "Create Key"
3. Copier la clé
4. Coller dans `.env.local`

**Vérifier que ça fonctionne**
```bash
curl -X POST https://your-app/api/projects/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour Claude"}'
```

---

### 2. Tables Supabase

**Exécuter le SQL** :
1. https://supabase.com/dashboard
2. Aller à SQL Editor
3. Copier tout le contenu de `supabase.sql`
4. Exécuter

**Vérifier que ça fonctionne** :
```bash
# Dans la console Supabase
SELECT * FROM projects LIMIT 1;  # Doit être vide (c'est normal)
SELECT * FROM agents;             # Doit être vide
SELECT * FROM agent_actions;      # Doit être vide
SELECT * FROM chat_messages;      # Doit être vide
```

---

### 3. Redémarrer le serveur
```bash
# Terminal
npm run dev
# Puis visitez http://localhost:3000
```

---

## 🎯 Premier Test (2 minutes)

### Créer un produit de test
1. Visitez http://localhost:3000
2. Cliquez "Créer un produit"
3. Remplissez :
   - Nom: "Produit Test"
   - Description: "Une super application"
   - Utilisateurs cibles: "PME en France"
   - Problème: "Gérer facilement les données clients"

### Affiner avec Claude
1. Allez à la page du produit
2. Section **"💬 Affiner le projet avec Claude"**
3. Posez : "Quel est mon marché principal ?"
4. Claude doit répondre avec JSON structuré

### Valider une action
1. Section **"📋 Actions à Valider"**
2. Vous devriez voir une action proposée
3. Cliquez sur l'action
4. Cliquez **"✅ Approuver"**

### Lancer le CEO
1. Bouton **"🚀 Lancer CEO"** en haut
2. Doit passer au vert (✅ 1 action validée)
3. Cliquez dessus
4. CEO doit répondre avec un plan 30 jours

---

## 🔧 Configuration Avancée

### Variables d'environnement

**Fichier**: `.env.local`

```bash
# Claude API
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API Base URL (local development)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production (optionnel)
# NEXT_PUBLIC_API_URL=https://your-domain.com
```

---

### Personnalisation Claude

**Où** : `app/api/projects/[id]/chat/route.ts`

**Système prompt actuel** :
```typescript
system: `You are Claude, embedded in Atlas Product Orchestration.
Your role: Help users build better products by providing strategic guidance based on project data.

Be conversational, precise, and data-backed.`
```

**Pour modifier** :
1. Ouvrez le fichier
2. Changez le `system` prompt
3. Redémarrez le serveur

---

### Personnalisation Orchestration

**Où** : `app/api/projects/[id]/orchestrate/route.ts`

**Pour modifier les phases** :
```typescript
// Ligne 9-43 - ORCHESTRATION_PROMPT
// Changez les phases, agents, tâches selon vos besoins
```

---

## 🐛 Dépannage

### "API Key Invalid"
**Symptômes** : Erreur 401 quand vous posez une question à Claude
**Solution** :
1. Vérifiez que vous avez une clé valide
2. Allez à https://console.anthropic.com/account/keys
3. Régénérez la clé
4. Mettez à jour `.env.local`
5. Redémarrez le serveur

### "Table doesn't exist"
**Symptômes** : Erreur 500 "agent_actions table not found"
**Solution** :
1. Allez à https://supabase.com/dashboard
2. Aller à SQL Editor
3. Exécutez `supabase.sql` en entier
4. Vérifiez que toutes les tables apparaissent dans la vue Tables

### "Actions n'apparaissent pas"
**Symptômes** : Vous posez une question, mais pas d'action dans "Actions à Valider"
**Solution** :
1. Vérifiez la console du navigateur (F12 → Console)
2. Cherchez les erreurs rouges
3. Allez à http://localhost:3000/api/health
4. Doit retourner `{ "status": "healthy" }`

### "Le bouton CEO ne répond pas"
**Symptômes** : Clic sur "Lancer CEO" → rien
**Solution** :
1. Ouvrez DevTools (F12 → Network)
2. Cliquez sur "Lancer CEO"
3. Regardez la requête `POST /api/projects/.../orchestrate`
4. Cherchez le détail de l'erreur
5. Vérifiez que les tables Supabase existent

---

## 📊 Architecture des Données

### Projects
```typescript
{
  id: UUID,
  name: string,
  description: string,
  target_users: string,
  problem: string,
  status: "ideation" | "validation" | "architecture" | "dev" | "launch",
  phase: number (0-4),
  created_at: timestamp,
  updated_at: timestamp
}
```

### Agent Actions
```typescript
{
  id: UUID,
  project_id: UUID,
  agent_id: UUID (nullable),
  title: string,
  description: string,
  action_type: "claude_suggestion" | "ceo_task" | "manual",
  priority: "low" | "medium" | "high",
  status: "pending" | "approved" | "rejected",
  user_feedback: string (nullable),
  details: JSON (flexible),
  created_at: timestamp,
  updated_at: timestamp
}
```

### Chat Messages
```typescript
{
  id: UUID,
  project_id: UUID,
  role: "user" | "assistant",
  message: string,
  thinking: string (nullable, for Claude thinking blocks),
  created_at: timestamp
}
```

---

## 🚀 Prochains Pas

- [ ] Configurez la clé Claude
- [ ] Exécutez le SQL Supabase
- [ ] Testez avec un produit demo
- [ ] Modifiez les prompts Claude selon vos besoins
- [ ] Customisez les phases d'orchestration
- [ ] Intégrez avec Paperclip (agents réels)
- [ ] Lancez un vrai produit!

---

**Questions ?** Consultez `SYSTEM-FLOW.md` pour le guide complet.
