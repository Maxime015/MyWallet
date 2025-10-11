# 💰 **e-Track API**

Une **API RESTful moderne** pour la **gestion de budgets, transactions et abonnements**, développée avec **Node.js** et **Express**.  
Elle offre une solution **performante**, **sécurisée** et **extensible** pour le suivi des dépenses et des revenus.

---

## 🧱 **Structure du Projet**

```plaintext
backend/
├── 📁 config/                # Configuration de l'application
│   ├── 🗄️ db.js              # Base de données PostgreSQL (Neon)
│   ├── 🔐 arcjet.js          # Sécurité Arcjet
│   ├── ⚡ upstash.js         # Redis Upstash
│   ├── ☁️ cloudinary.js     # Cloudinary
│   ├── 🔧 env.js            # Variables d'environnement
│   └── ⏰ cron.js           # Tâches planifiées
│
├── 📁 controllers/          # Logique métier
│   ├── 🔐 authController.js
│   ├── 📊 budgetController.js
│   ├── 💳 transactionController.js
│   └── 📅 subscriptionController.js
│
├── 📁 middleware/           # Middlewares personnalisés
│   ├── 🛡️ auth.middleware.js
│   ├── 🚦 rateLimiter.js
│   └── 🧱 arcjet.middleware.js
│
├── 📁 routes/               # Routes API
│   ├── 🔐 authRoutes.js
│   ├── 📊 budgetRoutes.js
│   ├── 💳 transactionRoutes.js
│   └── 📅 subscriptionsRoute.js
│
├── 📁 docs/
│   └── 📘 swagger.yaml     # Documentation OpenAPI/Swagger
│
├── 🚀 server.js
├── 📄 package.json
└── 📖 README.md
```

---

## 🚀 **Fonctionnalités**

### 🔐 **Authentification & Sécurité**
- Authentification **JWT** (expiration 15 jours)  
- Middleware de **protection des routes**  
- Validation robuste des données  
- Génération automatique d'**avatars DiceBear**  
- **Rate limiting** intelligent via Upstash Redis  
- **Limitation des tentatives de connexion** (3/min)  

### 📊 **Budgets**
- Création, suppression et consultation de budgets  
- Catégorisation flexible (alimentation, transport…)  
- Suivi en temps réel et pourcentages d'utilisation  
- Détection des budgets atteints + résumés détaillés  

### 💳 **Transactions**
- Ajout / suppression de transactions par budget  
- Historique filtré par catégorie  
- Vérification automatique du solde disponible  
- Résumé global (revenus, dépenses, solde)  

### 📅 **Abonnements**
- Création, consultation, suppression  
- Gestion des récurrences (mensuelle, annuelle…)  
- Système de notation (1 à 5 étoiles)  
- Upload d'images via **Cloudinary**  
- Résumé total des coûts d'abonnement  

### 🛡️ **Sécurité Avancée**
- **Arcjet Protection** (bots, attaques)  
- **Rate limiting multicouche** (Upstash + middleware)  
- **Token Bucket Algorithm**  
- **bcrypt** pour hashage des mots de passe  
- **JWT sécurisés** avec vérification d’expiration  

---

## 📋 **Prérequis**

- [Node.js](https://nodejs.org) v18 ou supérieur  
- [PostgreSQL Neon](https://neon.tech)  
- [Cloudinary](https://cloudinary.com)  
- [Arcjet](https://arcjet.com)  
- [Upstash Redis](https://upstash.com)  

---

## ⚙️ **Installation**

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/Maxime015/eTrack-Backend.git
cd backend
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configurer les variables d'environnement

```bash
cp .env.example .env
```

**Exemple `.env`** :

```bash
# Server
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret

# Database
DATABASE_URL=<votre_url_postgresql_neon>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<nom>
CLOUDINARY_API_KEY=<clé>
CLOUDINARY_API_SECRET=<secret>

# Security
ARCJET_KEY=<clé_arcjet>
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>

# Cron
API_URL=https://votre-app.render.com
```

### 4️⃣ Initialiser la base de données

```bash
npm run db:init
```

### 5️⃣ Lancer le serveur

```bash
# Développement
npm run dev

# Production
npm start
```

---

## 📚 **Documentation API**

Swagger : 👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

| Type | Endpoint | Description |
|------|----------|-------------|
| 📘 Docs | `/api-docs` | Interface Swagger |
| ❤️ Health | `/health` | Vérifie l’état du serveur |
| 🔐 Auth | `/api/auth/*` | Authentification |
| 📊 Budgets | `/api/budgets/*` | Gestion budgets |
| 💳 Transactions | `/api/transactions/*` | Gestion transactions |
| 📅 Subscriptions | `/api/subscriptions/*` | Abonnements |

---

## 🗂️ **Endpoints Principaux**

### 🔐 Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/auth/login` | Connexion | ❌ |
| GET  | `/api/auth/profile-images` | Avatars dispo | ✅ |

### 📊 Budgets

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/budgets` | Créer un budget | ✅ |
| DELETE | `/api/budgets/:budgetId` | Supprimer un budget | ✅ |
| GET | `/api/budgets/all-summaries` | Résumé global | ✅ |
| GET | `/api/budgets/reached` | Budgets atteints | ✅ |

### 💳 Transactions

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/transactions` | Ajouter une transaction | ✅ |
| GET  | `/api/transactions/my-transactions` | Mes transactions | ✅ |
| GET  | `/api/transactions/budget/:budgetId` | Transactions d’un budget | ✅ |
| GET  | `/api/transactions/summary` | Résumé global | ✅ |
| DELETE | `/api/transactions/:transactionId` | Supprimer une transaction | ✅ |

### 📅 Abonnements

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/subscriptions/:userId` | Lister abonnements | ✅ |
| POST | `/api/subscriptions` | Créer un abonnement | ✅ |
| DELETE | `/api/subscriptions/:id` | Supprimer un abonnement | ✅ |
| GET | `/api/subscriptions/summary/:userId` | Résumé abonnements | ✅ |

---

## 🗃️ **Structure de la Base de Données**

### 👥 Table `users`

| Colonne | Type | Détails | Contraintes |
|---------|------|---------|-------------|
| id | SERIAL | Identifiant | PK |
| username | VARCHAR(255) | Nom utilisateur | UNIQUE, NOT NULL |
| email | VARCHAR(255) | Email | UNIQUE, NOT NULL |
| password | VARCHAR(255) | Hashé bcrypt | NOT NULL |
| profile_image | VARCHAR(255) | URL | DEFAULT DiceBear |
| created_at | TIMESTAMPTZ | Date création | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Date modif | DEFAULT NOW() |

(📊 Budgets / 💸 Transactions / 📅 Subscriptions suivent la même logique — voir documentation détaillée)

---

## 🛡️ **Sécurité**

### 🔒 Arcjet Protection
- **Shield Mode** : XSS, SQLi, CSRF  
- **Bot Detection** (whitelist moteurs de recherche)  
- **Token Bucket** : 10 requêtes / 10s  
- **IP Tracking**

### 🚦 Rate Limiting
- Upstash Redis : 100 requêtes/min/IP  
- 3 tentatives de login / min  
- **Sliding Window Algorithm**

### 🔐 Authentification
- **JWT** (15 jours)  
- **bcrypt** + salt 10  
- Validation stricte des inputs

---

## ⚡ **Performance & Monitoring**

### 🔄 Tâches Planifiées (Cron)
```javascript
"*/14 * * * *"  // Toutes les 14 minutes
```

### 📊 Endpoint `/health`
- Statut du serveur  
- Timestamp  
- Environnement  
- Message  

---

## 🚀 **Déploiement**

### 📦 Scripts

```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "db:init": "node -e \"import('./config/db.js').then(m => m.initDB())\""
}
```

### 🌐 Variables Prod

```bash
NODE_ENV=production
DATABASE_URL=<url_neon>
ARCJET_KEY=<clé_arcjet_prod>
JWT_SECRET=<secret_32_caractères>
CLOUDINARY_CLOUD_NAME=<cloud_name_prod>
```

### ☁️ Services Externes
- Neon (DB)
- Cloudinary (images)
- Arcjet (sécurité)
- Upstash Redis (rate limiting)
- Render/Vercel (hébergement + cron)

---

## 🐛 **Dépannage**

| Problème | Vérification |
|----------|--------------|
| Erreur DB | `DATABASE_URL` correcte |
| JWT invalide | `JWT_SECRET` et expiration |
| Rate limiting | Config Upstash/Arcjet |
| Upload image | Credentials Cloudinary |

Logs détaillés en dev + health checks pour monitoring.

---

## 🤝 **Contribution**

1. Fork le projet  
2. Crée une branche feature  
3. Commit → Push → Pull Request ✨

---

## 📄 **Licence**

Projet sous licence **MIT**. Voir [LICENSE](./LICENSE).

---

## 📞 **Support**

- 📘 **Docs** : `/api-docs`  
- 🐛 **Issues** : GitHub  
- 💬 **Contact** : Équipe dev

---

> 🧠 **Développé avec ❤️ pour une gestion financière intelligente et sécurisée**  
> _“Une gestion financière transparente pour une vie sereine”_
