# ⚡ Quick Start - 5 Minutes pour Démarrer

## 🚀 Checklist de Configuration (5 min)

### ✅ Étape 1 : Clé Claude API (2 min)

```bash
# 1. Allez à https://console.anthropic.com/account/keys
# 2. Cliquez "Create New Key"
# 3. Copier la clé (ex: sk-ant-v1-...)

# 4. Ouvrez .env.local
# 5. Remplacez la ligne:
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-VOTRE-CLE-ICI
#                                    ↑ Collez votre clé ici

# 6. Sauvegardez le fichier
```

**Vérification**:
```bash
# La clé doit commencer par: sk-ant-
# La clé ne doit JAMAIS être pussiez sur GitHub
```

---

### ✅ Étape 2 : SQL Supabase (2 min)

```bash
# 1. Allez à https://supabase.com/dashboard
# 2. Sélectionnez votre projet
# 3. Allez à SQL Editor (sidebar gauche)

# 4. Créer une nouvelle query
# 5. Copier TOUT le contenu de supabase.sql
# 6. Coller dans la query
# 7. Cliquez "RUN"

# ✅ Succès = Les tables apparaissent dans la vue Tables
#    (projects, agents, agent_actions, chat_messages)
```

---

### ✅ Étape 3 : Redémarrer (1 min)

```bash
# Terminal 1 (arrêter l'ancien serveur si running)
Ctrl + C

# Terminal 1 (relancer)
npm run dev

# ✅ Succès = Message "Ready in Xms"
#    Visitez http://localhost:3000
```

---

## 🎯 Premier Test (2 minutes)

### 1️⃣ Créer un Produit

```
URL: http://localhost:3000
Cliquez: "Créer un produit"

Remplissez:
  Nom: "Mon Super Produit"
  Description: "Une appli qui résout le problème X"
  Utilisateurs cibles: "PME en France"
  Problème résolu: "Automatiser la gestion des données"

Cliquez: "Créer le produit"
```

✅ **Résultat**: Vous êtes sur la page du produit

---

### 2️⃣ Discuter avec Claude

```
Allez à: Section "💬 Affiner le projet avec Claude"

Posez une question:
  "Quel est mon marché principal ?"

Claude doit répondre avec:
  💡 Insight: [quelque chose]
  ✅ Recommandations: [3 points]
  ❓ Question: [une question]
```

✅ **Résultat**: Réponse structurée, pas d'erreur

---

### 3️⃣ Valider l'Action

```
Allez à: Section "📋 Actions à Valider"

Vous devriez voir 1 action proposée:
  Title: [Quelque chose basé sur la réponse Claude]
  Status: ⏳ En attente

Cliquez sur l'action
Cliquez: "✅ Approuver"

Status change à: "✅ Approuvée"
```

✅ **Résultat**: Action approuvée, sauvegardée

---

### 4️⃣ Lancer le CEO

```
Allez à: Bouton en haut "🚀 Lancer CEO"

Le bouton doit être:
  ✅ VERT (enabled)
  ✅ Affiche "✅ 1 action validée"

Cliquez: "🚀 Lancer CEO"

Alert devrait apparaître:
  "🚀 CEO Agent a lancé l'orchestration !"
```

✅ **Résultat**: CEO a lancé les agents!

---

### 5️⃣ Voir les Agents

```
Allez à: Section "🤖 Graphe d'Agents"

Vous devriez voir:
  ✅ CEO Orchestrator (🟢 ACTIVE)
  ✅ Market Researcher (🟢 ACTIVE)
  ✅ Competitive Analyst (🟢 ACTIVE)
  ✅ Customer Interviewer (🟢 ACTIVE)

Cliquez sur un agent pour voir les tâches
```

✅ **Résultat**: Agents visibles et actifs!

---

## 🔧 Dépannage Rapide

### ❌ "Clé API invalide"
```bash
# Solution:
1. Vérifiez que la clé commence par sk-ant-
2. Vérifiez qu'il n'y a pas d'espaces
3. Régénérez la clé si nécessaire
4. Redémarrez avec npm run dev
```

### ❌ "Table doesn't exist"
```bash
# Solution:
1. Vérifiez que vous avez exécuté le SQL
2. Allez à Supabase → Tables
3. Vous devriez voir: projects, agents, ...
4. Si vide, exécutez le SQL à nouveau
```

### ❌ "Claude ne répond pas"
```bash
# Solution:
1. Ouvrez DevTools (F12)
2. Allez à Console
3. Cherchez les erreurs rouges
4. Vérifiez NEXT_PUBLIC_CLAUDE_API_KEY dans .env.local
5. Redémarrez le serveur
```

### ❌ "Actions n'apparaissent pas"
```bash
# Solution:
1. Rafraîchissez la page (F5)
2. Vérifiez la console du navigateur (F12 → Console)
3. Vérifiez que Claude a bien répondu
4. Vérifiez que les tables existent en Supabase
```

### ❌ "Bouton CEO reste gris"
```bash
# Solution:
1. Vérifiez que vous avez validé au moins 1 action
2. Section "Actions à Valider" doit afficher l'action
3. Status doit être "✅ Approuvée" (pas "En attente")
4. Actualisez la page et réessayez
```

---

## 📚 Prochaines Lectures (Par Ordre)

1. **Maintenant** ← Vous êtes ici (QUICK-START.md)
2. **Comprendre le flux** → `SYSTEM-FLOW.md` (15 min)
3. **Architecture** → `ARCHITECTURE.md` (visuel)
4. **Setup complet** → `SETUP-FEEDBACK-SYSTEM.md` (détails)
5. **Changements** → `CHANGES-SUMMARY.md` (ce qui a été modifié)

---

## 💡 Conseils d'Utilisation

### Flux Recommandé
```
1. Créer produit
2. Affiner avec Claude (3-5 messages)
3. Valider 3-5 actions
4. Lancer CEO
5. Observer les agents
6. Continuer à discuter avec Claude
```

### Questions Utiles pour Claude
```
"Quel est mon marché principal ?"
"Comment me différencier ?"
"Quels sont les 3 risques ?"
"Quel doit être mon MVP ?"
"Comment prioriser ?"
"Quel business model ?"
```

### Feedback Utile lors de la Validation
```
"D'accord, je vais commencer par..."
"Non, c'est déjà fait, je vais plutôt..."
"Oui, et en plus j'ai 5 utilisateurs testeurs"
"Priorité: je veux d'abord valider le TAM"
```

---

## ⏱️ Temps Estimé

```
Configuration totale      5 min
Premier test complet      5 min
Affinement d'un produit   15-30 min
Lancement du CEO          1 click
Suivi des agents          Continu

TOTAL pour démarrer: 10 minutes
```

---

## ✅ Vérification Finale

Avant de dire "terminé", vérifiez:

- [ ] Clé Claude API configurée dans .env.local
- [ ] SQL Supabase exécuté (tables créées)
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Produit créé et accessible
- [ ] Claude répond à une question
- [ ] Action proposée par Claude
- [ ] Action validée et sauvegardée
- [ ] Bouton CEO devient vert après validation
- [ ] CEO se lance et crée les agents
- [ ] Agents visibles dans le Graphe

**Si tout est ✅** → Vous êtes prêt!

---

## 🎉 Succès!

Vous avez maintenant un système complet et fonctionnel:

```
Claude propose → Vous validez → CEO exécute → Agents travaillent
```

🚀 **Prêt à lancer votre premier produit!**

---

Pour des questions, consultez:
- **Setup détaillé**: `SETUP-FEEDBACK-SYSTEM.md`
- **Flux complet**: `SYSTEM-FLOW.md`
- **Architecture**: `ARCHITECTURE.md`

**Bonne chance!** 🎯
