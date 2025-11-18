# 📊 Finance Exporter — Générateur Automatisé de Rapports Financiers

<svg xmlns="http://www.w3.org/2000/svg" width="109" height="20" role="img" aria-label="Python: 3.10+">
  <title>Python: 3.10+</title>
  <rect width="66" height="20" fill="#555"/>
  <rect x="66" width="43" height="20" fill="#007ec6"/>
  <text x="33" y="14" fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="11" text-anchor="middle">Python</text>
  <text x="87.5" y="14" fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="11" text-anchor="middle">3.10+</text>
</svg>

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-✓-blue?logo=postgresql)
![Excel](https://img.shields.io/badge/Excel-Automatisation-1D6F42?logo=microsoft-excel)
![Pandas](https://img.shields.io/badge/Pandas-Analyse%20de%20données-yellow?logo=pandas)
![Status](https://img.shields.io/badge/Statut-Stable-brightgreen)

## 🧾 Vue d’ensemble

**Finance Exporter** est un moteur Python automatisé qui génère un  
**rapport financier Excel complet et professionnel**, basé sur les données d’une base PostgreSQL.

Le script produit un export contenant :

- 📅 **Feuilles mensuelles** avec toutes les transactions  
- 🔍 **Analyses basées sur les catégories**  
- 📈 **Graphiques modernes** (anneau, camembert, colonnes empilées)  
- 💳 **Aperçu complet des abonnements**  
- 📘 **Synthèse globale avec tendances, KPIs & graphiques d’évolution**  
- 🎨 **Mise en forme professionnelle** (couleurs, mise en page, emojis)

Chaque fichier généré suit le format :

```
rapport_financier_YYYYMMDD_HHMMSS.xlsx
```

---

## 🚀 Fonctionnalités Principales

### 🗄️ 1. Intégration PostgreSQL

Lecture de la variable d’environnement `DATABASE_URL` (via **python-dotenv**) et extraction :

- `transactions`  
- `subscriptions`

---

### 📅 2. Organisation Mensuelle Intelligente

- Regroupement des données par mois  
- Noms de mois en français  
- Mise en forme automatique des montants  
- Tri chronologique

---

### 📊 3. Feuilles Mensuelles de Transactions

Chaque onglet mensuel inclut :

- La liste complète des transactions  
- Totaux revenus / dépenses  
- Solde net du mois  
- Répartition par catégorie  
- **Graphique dynamique en anneau**

---

### 💳 4. Gestion des Abonnements

Feuille dédiée avec :

- Liste complète des abonnements  
- Coût mensuel récurrent total  
- Statistiques globales  
- **Camembert par type d’abonnement**

---

### 📈 5. Synthèse Financière Globale

La feuille **SYNTHÈSE** contient :

- Total des revenus et dépenses  
- Solde final  
- Moyenne mensuelle  
- Nombre de transactions & abonnements  
- Tableau d’évolution mensuelle  
- **Graphique Revenus vs Dépenses**

---

### 🎨 6. Mise en Forme Professionnelle

- Police moderne (Helvetica Neue)  
- Palette de couleurs cohérente  
- Hiérarchie visuelle claire  
- Emojis pour une meilleure compréhension  
- Mise en forme conditionnelle

---

## 📦 Installation

### 1. Installer les dépendances

```bash
pip install psycopg2-binary pandas xlsxwriter python-dotenv
```

### 2. Configurer `.env`

Créer un fichier `.env` :

```
DATABASE_URL=postgres://user:password@host:port/database
```

### 3. Lancer le script

```bash
python main.py
```

---

## 📂 Structure de la Base de Données

### **transactions**

| Colonne     | Type          | Description                                 |
|-------------|---------------|---------------------------------------------|
| id          | UUID / int    | Identifiant unique                          |
| user_id     | UUID / int    | Propriétaire                                |
| title       | text          | Nom de la transaction                       |
| amount      | numeric       | Positif = revenu, négatif = dépense         |
| category    | text          | Catégorie                                   |
| created_at  | timestamp     | Date                                        |

---

### **subscriptions**

| Colonne     | Type         |
|-------------|--------------|
| id          | UUID         |
| user_id     | UUID         |
| label       | text         |
| amount      | numeric      |
| date        | text (ISO)   |
| recurrence  | text         |
| rating      | int          |
| image_url   | text         |
| created_at  | timestamp    |

---

## 📁 Exemples de Données

### Transaction

```json
{
  "id": 42,
  "user_id": 10,
  "title": "Courses Supermarché",
  "amount": -45.90,
  "category": "Alimentation",
  "created_at": "2025-01-15T10:30:00"
}
```

### Subscription

```json
{
  "id": 12,
  "user_id": 10,
  "label": "Spotify",
  "amount": 9.99,
  "date": "2025-01-01",
  "recurrence": "mensuel",
  "rating": 4,
  "image_url": ""
}
```

---

## 📤 Résultat Généré

Le fichier Excel final contient :

- 📅 **12 feuilles mensuelles**  
- 💳 **1 feuille d’abonnements**  
- 📘 **1 feuille SYNTHÈSE**  
- 📈 Graphiques automatiques :
  - Anneau  
  - Camembert  
  - Colonnes empilées  
- 🎨 Formatage professionnel complet

---

## 🙋‍♂️ Dépannage

**Erreur de connexion ?**  
→ Vérifiez la valeur de `DATABASE_URL` dans `.env`

**Pas de données ?**  
→ Vérifiez les tables `transactions` et `subscriptions`

Fait avec ❤️ pour simplifier la gestion financière.
