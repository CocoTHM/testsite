🚀 ÉTAPES SUIVANTES - DÉPLOIEMENT BACKEND
========================================

## ✅ Vous êtes dans le service "backend" sur Railway Dashboard

### 📍 ÉTAPE 1 : Connecter le code source

**Option A - GitHub (recommandé)** :
1. Settings → Source
2. "Connect GitHub Repo"
3. Sélectionnez votre repo
4. Root Directory : laissez vide ou mettez `/backend` si monorepo
5. Branch : `main`
6. Cliquez "Deploy"

**Option B - Upload local** :
1. Settings → Source  
2. "Deploy from CLI"
3. Suivez les instructions OU utilisez le terminal ci-dessous

### 📍 ÉTAPE 2 : Déployer depuis le terminal

Si vous préférez le terminal :

```bash
cd "/Users/coco/Documents/Site shelve:app/backend"
railway link
# Sélectionnez "backend" dans la liste
railway up --detach
```

### 📍 ÉTAPE 3 : Attendre le build (3-5 minutes)

Le build va :
- ✅ Installer les dépendances (npm install)
- ✅ Générer Prisma Client
- ✅ Compiler TypeScript
- ✅ Démarrer le serveur Node.js

Suivez les logs dans Railway Dashboard → Service backend → Deployments

### 📍 ÉTAPE 4 : Générer le domaine public

Une fois le statut = **SUCCESS** :

1. Settings → Networking
2. Section "Public Networking"
3. Cliquez "Generate Domain"
4. **Copiez l'URL** : `https://backend-production-xxxx.up.railway.app`

### 📍 ÉTAPE 5 : Ajouter BACKEND_URL

1. Variables → Add Variable
2. Key : **BACKEND_URL**
3. Value : `https://backend-production-xxxx.up.railway.app`
4. Save (le service redémarre automatiquement)

### 📍 ÉTAPE 6 : Tester l'API

```bash
curl https://backend-production-xxxx.up.railway.app/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T..."
}
```

---

## 🎯 PRÊT POUR LE FRONTEND ?

Une fois que vous avez l'URL du backend, donnez-la moi et je déploie automatiquement le frontend sur Vercel !

**Quelle étape êtes-vous en train de faire ?**
