<div align="center">
    <img src="./mobile/assets/images/screenshots/icon.png" width="128" height="128" style="display: block; margin: 0 auto"/>
    <h1>💸 MyWallet - Suivi de Dépenses avec React Native & Express 🚀</h1>
    <p>
        <strong>MyWallet</strong>est une application de gestion financière conçue pour simplifier le suivi et la maîtrise de vos finances personnelles
    Construite avec <strong>Expo</strong>, <strong>Express.js</strong> et <strong>PostgreSQL (Neon)</strong>, Elle permet de <strong>suivre vos transactions**, **gérer vos abonnements récurrents** et **analyser votre situation financière</strong> grâce à des résumés clairs et automatisés.
    </p>
</div>

------------------------------------------------------------------------
---

## 📸 Screenshots

<div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">

  <img src="./mobile/assets/images/screenshots/1.png" style="width: 32%; margin-bottom: 10px;" />
  <img src="./mobile/assets/images/screenshots/2.png" style="width: 32%; margin-bottom: 10px;" />
  <img src="./mobile/assets/images/screenshots/3.png" style="width: 32%; margin-bottom: 10px;" />

  <img src="./mobile/assets/images/screenshots/4.png" style="width: 32%; margin-bottom: 10px;" />
  <img src="./mobile/assets/images/screenshots/5.png" style="width: 32%; margin-bottom: 10px;" />
  <img src="./mobile/assets/images/screenshots/6.png" style="width: 32%; margin-bottom: 10px;" />

  <img src="./mobile/assets/images/screenshots/7.png" style="width: 32%; margin-bottom: 10px;" />
  <img src="./mobile/assets/images/screenshots/8.png" style="width: 32%; margin-bottom: 10px;" />
  <img src="./mobile/assets/images/screenshots/9.png" style="width: 32%; margin-bottom: 10px;" />

</div>

------------------------------------------------------------------------

## 🧑‍🍳 Aperçu des fonctionnalités de l'app

- 🔐 **Authentification sécurisée** avec validation par email grâce à **JSON Web Token (JWT)**
- 📝 Flux complet **Inscription & Connexion** avec code de vérification à 6 chiffres
- 🏠 **Écran d'accueil** affichant le solde actuel et l’historique des transactions
- ➕ **Création de transactions** : ajouter un **revenu** ou une **dépense**
- 🔄 Fonctionnalité **Pull to Refresh** développée de zéro
- 🗑️ **Suppression de transactions** avec mise à jour immédiate du solde
- 🚪 **Déconnexion** sécurisée pour revenir à l’écran de connexion

------------------------------------------------------------------------

## 🚀 Fonctionnalités

### 🔐 Authentification Sécurisée

- Inscription et connexion avec validation des entrées
- Authentification basée sur **JWT (JSON Web Tokens)**
- Middleware de sécurité pour protéger les routes sensibles
- Système de **limitation des tentatives de connexion** (anti brute-force)

### 💰 Gestion des Transactions

- ➕ Ajout de transactions (revenus / dépenses)
- 📋 Consultation de toutes les transactions
- 🗑️ Suppression d’une transaction en un clic
- 📊 Tableau de bord financier : solde total, revenus cumulés, dépenses totales

### 🗕️ Gestion des Abonnements

- ➕ Ajout d’abonnements (Netflix, Spotify, etc.)
- 👀 Visualisation et suppression des abonnements
- 🌟 Attribution d’une **note de 1 à 5 étoiles**
- 🖼️ Téléversement d’images via **Cloudinary**
- 📈 Aperçu global : coût mensuel total, nombre d’abonnements, récapitulatif visuel

------------------------------------------------------------------------


## 🛠️ Technologies Utilisées

| 🌐 Domaine             | 🚀 Technologie                             |
| ---------------------- | ------------------------------------------- |
| 🖥️ Backend             | Node.js, Express.js                         |
| 🗄️ Base de données     | PostgreSQL (via **Neon**)                   |
| 🔐 Authentification    | JWT (JSON Web Tokens)                       |
| 🛡️ Sécurité            | bcryptjs, CORS, validation côté serveur     |
| ✉️ Envoi d’emails      | Resend                                      |
| 🖼️ Stockage d’images   | Cloudinary                                  |
| 📚 Documentation       | Swagger / OpenAPI                           |
| ⚡ Rate Limiting       | Upstash Redis                                |
| ⏰ Planification       | Cron Jobs                                    |
| 🚀 Déploiement         | Render                                       |


------------------------------------------------------------------------
## ⚙️ Installation et Démarrage

### 🔧 Prérequis

* Node.js **v18+**
* Compte **Neon PostgreSQL**
* Compte **Cloudinary**
* Compte **Resend**
* Compte **Render**

## 🧩 Configuration du fichier `.env`

### ⚙️ Backend (`/backend`)

``` bash
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL=votre_url_neon_postgresql

# JWT
JWT_SECRET=votre_secret_jwt

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=votre_url_redis
UPSTASH_REDIS_REST_TOKEN=votre_token_redis


RESEND_API_KEY=votre_api_key
EMAIL_FROM="onboarding@resend.dev"
EMAIL_FROM_NAME="your_name"
```

### 📱 Mobile (`/mobile`)

``` bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<votre_cle_clerk>
```
------------------------------------------------------------------------

## 🚀 Démarrer le Projet

Suivez ces étapes pour installer Nexus :

## 🔥 Cloner le dépôt
```bash
git clone https://github.com/ikyawthetpaing/Nexus.git
```

------------------------------------------------------------------------

## ⚙️ Lancer le backend

``` bash
cd backend
npm install
npm run dev
```

------------------------------------------------------------------------

## 📱 Lancer le mobile

``` bash
cd mobile
npm install
npx expo start
```

---

# 🧲 Finance Exporter

## 📋 Description
Script Python qui génère des rapports financiers Excel à partir d'une base **PostgreSQL**. Organise les transactions par mois, analyse les abonnements et crée des graphiques visuels.
---
![image application](./mobile/assets/images/screenshots/excel1.png)
---
![image application](./mobile/assets/images/screenshots/excel2.png)
---
![image application](./mobile/assets/images/screenshots/excel3.png)
---

## 🚀 Fonctionnalités
- 📊 Export Excel avec onglets mensuels
- 💳 Gestion des abonnements
- 📈 Graphiques et statistiques
- 🎨 Design moderne avec couleurs

## 🛠 Installation
### Prérequis
```bash
pip install psycopg2-binary pandas xlsxwriter python-dotenv
```
### Configuration
Fichier `.env` :
```env
DATABASE_URL=postgresql://user:pass@host:port/db
```

## 🎯 Utilisation
```bash
python main.py
```

## 📊 Structure des données
**Transactions** : `id, user_id, title, amount, category, created_at`  
**Abonnements** : `id, user_id, label, amount, date, recurrence, rating`

## 📁 Sortie
Fichier Excel avec :  
- 📈 Synthèse globale  
- 📅 Onglets mensuels  
- 💳 Abonnements  
- 📊 Graphiques et statistiques  

Génère un fichier : `rapport_financier_YYYYMMDD_HHMMSS.xlsx`

---

## 🤝 Contribuer au Projet

If you want to contribute to this project, please follow these steps:

1. Cloner le dépôt
2. Créer une branche
3. Apporter vos modifications
4. Créer une Pull Request détaillée

------------------------------------------------------------------------

## 📄 License

Projet sous licence MIT — voir le fichier [LICENSE](LICENSE).

## Contact

Pour toute question ou suggestion:

- [Maxime ANANIVI](mailto:maximeananivi@gmail.com)

Happy coding!