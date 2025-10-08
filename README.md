# 💸 **Budget Manager**  
### Application Web de Gestion Budgétaire & Sociale

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supported-blue?style=for-the-badge&logo=postgresql" />
</p>

---

## 🚀 **Présentation**

**Budget Manager** est une application web complète de gestion financière personnelle avec des fonctionnalités **sociales**.  
Elle permet de **suivre vos budgets**, **gérer vos transactions**, **maîtriser vos abonnements**, et **interagir avec une communauté** d’utilisateurs.

---

## ✨ **Fonctionnalités Principales**

### 💰 **Gestion Budgétaire**
- ✅ Création et suivi de budgets personnalisés  
- 📊 Tableaux de bord visuels avec indicateurs d’utilisation  
- 🏷️ Catégorisation intelligente des budgets  
- 📈 Statistiques et rapports détaillés  
- 🔔 Alertes de dépassement  

### 💳 **Gestion des Transactions**
- ➕ Enregistrement de revenus & dépenses  
- 🗂️ Association automatique aux budgets  
- 📅 Filtres temporels (7, 30, 90, 365 jours)  
- 💵 Résumé financier complet  
- 🗑️ Modification / suppression intuitive  

### 🔔 **Suivi des Abonnements**
- 📱 Gestion de tous vos abonnements (Netflix, Spotify, etc.)  
- 💰 Calcul automatique du coût mensuel/annuel  
- ⭐ Système de notation (1–5 étoiles)  
- 🖼️ Upload d’images (Cloudinary)  
- 📅 Rappels automatiques de renouvellement  

### 🛒 **Liste de Courses Collaborative**
- 📝 Création et partage de listes  
- ✅ Cocher/décocher les articles  
- 👥 Multi-utilisateurs  
- 📊 Statistiques du nombre d’articles  
- 🧹 Nettoyage rapide des listes  

### 👥 **Réseau Social Intégré**
- 📝 Création de posts (texte + image)  
- 💬 Système de commentaires  
- ❤️ Likes et interactions  
- 👥 Système de followers  
- 🔔 Notifications en temps réel  

### 🔐 **Sécurité et Authentification**
- 🔒 Authentification JWT sécurisée  
- 🔑 Hachage des mots de passe avec bcrypt  
- 🛡️ Middleware de protection des routes  
- ⚡ Rate limiting via Upstash Redis  
- 📧 Validation d’emails

---

## 🛠️ **Technologies Utilisées**

### ⚙️ **Backend**
| Technologie | Description |
|--------------|--------------|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Environnement d’exécution |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | Framework web |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) | Base de données |
| ![JWT](https://img.shields.io/badge/-JWT-000000?logo=json-web-tokens&logoColor=white) | Authentification |
| ![bcrypt](https://img.shields.io/badge/-bcrypt-000000) | Chiffrement des mots de passe |

### ☁️ **Services Externes**
| Service | Rôle |
|----------|------|
| ![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?logo=cloudinary&logoColor=white) | Stockage d’images |
| ![Upstash](https://img.shields.io/badge/-Upstash-00E9A3?logo=redis&logoColor=white) | Rate limiting / cache |
| ![Neon](https://img.shields.io/badge/-Neon-00E9A3) | Base de données serverless |

### 🧩 **Sécurité & Performance**
- 🔒 CORS  
- ⚡ Rate limiting  
- 📚 Swagger (documentation API)  
- ⏰ Cron Jobs  

---

## 📋 **Prérequis**

Avant de commencer, assurez-vous d’avoir installé :

- ![Node.js](https://img.shields.io/badge/-Node.js-18%2B-339933)  
- ![npm](https://img.shields.io/badge/-npm-8%2B-CB3837)  
- ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-15%2B-336791)

---

## 🚀 **Installation**

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/votre-username/budget-manager.git
cd budget-manager
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configurer les variables d’environnement
Créer un fichier `.env` à la racine du projet :
```bash
# Base de données
DATABASE_URL=votre_url_postgresql

# JWT
JWT_SECRET=votre_secret_jwt

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=votre_url_redis
UPSTASH_REDIS_REST_TOKEN=votre_token_redis

# Configuration
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
```

### 4️⃣ Initialisation de la base de données
> Les tables sont créées automatiquement au démarrage du serveur :

| Table | Description |
|--------|--------------|
| 👥 `users` | Gestion des utilisateurs |
| 💰 `budgets` | Budgets utilisateur |
| 💳 `transactions` | Transactions financières |
| 🔔 `subscriptions` | Abonnements |
| 🛒 `groceries` | Listes de courses |
| 📝 `posts` | Publications sociales |
| 💬 `comments` | Commentaires |
| ❤️ `post_likes` | Likes |
| 👥 `followers` | Relations entre utilisateurs |

### 5️⃣ Démarrer l’application
**Mode développement :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```
> L’application sera accessible sur : [http://localhost:3000](http://localhost:3000)

---

## 📚 **Documentation API (Swagger)**
Accessible via :  
👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

**Exemples de routes principales :**
| Catégorie | Méthode | Route | Description |
|------------|----------|--------|-------------|
| Auth | `POST` | `/api/auth/register` | Créer un compte |
| Auth | `POST` | `/api/auth/login` | Connexion |
| Budgets | `GET` | `/api/budgets/summary` | Résumé des budgets |
| Transactions | `GET` | `/api/transactions/summary` | Résumé financier |

---

## 🏗️ **Structure du Projet**
```
budget-manager/
├── 📁 config/                # Configuration générale
│   ├── db.js                # Connexion à PostgreSQL
│   ├── cloudinary.js        # Service d’upload
│   └── upstash.js           # Rate limiting
├── 📁 controllers/           # Logique métier
│   ├── authController.js
│   ├── budgetController.js
│   ├── transactionController.js
│   └── ...
├── 📁 middleware/            # Sécurité et validations
│   ├── auth.middleware.js
│   └── upload.middleware.js
├── 📁 routes/                # Routes API
├── 📁 docs/                  # Documentation Swagger
└── server.js                 # Point d’entrée
```

---

## 💡 **Auteur & Contributions**
👤 **Développeur principal :** [Votre Nom]  
💌 Pour toute contribution, ouvrez une *pull request* ou créez une *issue*.

---

## 🧾 **Licence**
Distribué sous licence MIT.  
© 2025 - Budget Manager
