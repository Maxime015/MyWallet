import os
import psycopg2
import pandas as pd
from datetime import datetime
import xlsxwriter
from urllib.parse import urlparse
from collections import defaultdict
from dotenv import load_dotenv

# Charger les variables d'environnement du fichier .env
load_dotenv()

# Configuration de la base de données (récupérée depuis .env)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ La variable d'environnement DATABASE_URL n'est pas définie dans le fichier .env")

# Exemple de connexion (optionnel)
# conn = psycopg2.connect(DATABASE_URL)


# Palette de couleurs moderne et cohérente
COLORS = {
    'primary': '#002A00',
    'success': '#71D561',
    'accent': '#388030',
    'light': '#F8FAF8',
    'dark': '#1A1A1A',
    'warning': '#FFA500',
    'danger': '#FF4444',
    # Palette diversifiée avec couleurs chaudes et froides pour les graphiques
    'chart_colors': [
        '#FF6B6B',  # Rouge corail (chaud)
        '#4ECDC4',  # Turquoise (froid)
        '#FFD93D',  # Jaune doré (chaud)
        '#6C5CE7',  # Violet (froid)
        '#FF8A5B',  # Orange (chaud)
        '#51CF66',  # Vert menthe (froid)
        '#FF6B9D',  # Rose (chaud)
        '#3B82F6',  # Bleu roi (froid)
        '#FFA94D',  # Orange pêche (chaud)
        '#22D3EE',  # Cyan (froid)
        '#F59E0B',  # Ambre (chaud)
        '#8B5CF6',  # Pourpre (froid)
        '#EF4444',  # Rouge vif (chaud)
        '#14B8A6',  # Teal (froid)
        '#FB923C',  # Orange tangerine (chaud)
        '#06B6D4'   # Bleu ciel (froid)
    ]
}

MOIS_TRADUCTION = {
    "january": "Janvier", "february": "Février", "march": "Mars",
    "april": "Avril", "may": "Mai", "june": "Juin",
    "july": "Juillet", "august": "Août", "september": "Septembre",
    "october": "Octobre", "november": "Novembre", "december": "Décembre"
}

class FinanceExporter:
    def __init__(self):
        self.workbook = None
        self.transactions_data = defaultdict(list)
        self.subscriptions_data = []
        self.formats = {}

    def get_db_connection(self):
        """Établit une connexion à la base de données"""
        try:
            result = urlparse(DATABASE_URL)
            conn = psycopg2.connect(
                database=result.path[1:],
                user=result.username,
                password=result.password,
                host=result.hostname,
                port=result.port
            )
            self._print_success("Connexion à la base de données établie")
            return conn
        except Exception as e:
            self._print_error(f"Erreur de connexion: {e}")
            return None

    def fetch_transactions(self):
        """Récupère toutes les transactions"""
        conn = self.get_db_connection()
        if not conn:
            return None
        
        try:
            query = """
            SELECT id, user_id, title, amount, category, created_at
            FROM transactions 
            ORDER BY created_at DESC
            """
            df = pd.read_sql_query(query, conn)
            self._print_success(f"{len(df)} transactions récupérées")
            self._organize_transactions_by_month(df)
            return df
        except Exception as e:
            self._print_error(f"Erreur lors de la récupération des transactions: {e}")
            return None
        finally:
            conn.close()

    def _organize_transactions_by_month(self, df):
        """Organise les transactions par mois"""
        df['created_at'] = pd.to_datetime(df['created_at'])
        
        for _, transaction in df.iterrows():
            mois_nom_en = transaction['created_at'].strftime("%B").lower()
            mois_nom_fr = MOIS_TRADUCTION.get(mois_nom_en, mois_nom_en)
            
            self.transactions_data[mois_nom_fr].append({
                'title': transaction['title'],
                'category': transaction['category'],
                'amount': float(transaction['amount']),
                'date': transaction['created_at'].strftime("%Y-%m-%d"),
                'id': str(transaction['id'])
            })

    def fetch_subscriptions(self):
        """Récupère tous les abonnements"""
        conn = self.get_db_connection()
        if not conn:
            return None
        
        try:
            query = """
            SELECT id, user_id, label, amount, date, recurrence, rating, image_url, created_at
            FROM subscriptions 
            ORDER BY created_at DESC
            """
            df = pd.read_sql_query(query, conn)
            self._print_success(f"{len(df)} abonnements récupérés")
            self.subscriptions_data = df.to_dict('records')
            return df
        except Exception as e:
            self._print_error(f"Erreur lors de la récupération des abonnements: {e}")
            return None
        finally:
            conn.close()

    def initialize_formats(self):
        """Initialise tous les formats Excel"""
        # Format titre principal
        self.formats['title'] = self.workbook.add_format({
            'bold': True,
            'font_size': 20,
            'align': 'center',
            'valign': 'vcenter',
            'font_color': COLORS['primary'],
            'font_name': 'Helvetica Neue',
            'bg_color': COLORS['success'],
            'border': 2
        })
        
        # Format en-tête
        self.formats['header'] = self.workbook.add_format({
            'bold': True,
            'align': 'center',
            'valign': 'vcenter',
            'bg_color': COLORS['success'],
            'font_name': 'Helvetica Neue',
            'font_color': COLORS['primary'],
            'border': 1,
            'font_size': 11
        })
        
        # Format sous-en-tête
        self.formats['subheader'] = self.workbook.add_format({
            'bold': True,
            'align': 'left',
            'valign': 'vcenter',
            'bg_color': COLORS['accent'],
            'font_name': 'Helvetica Neue',
            'font_color': 'white',
            'border': 1,
            'font_size': 12
        })
        
        # Format normal
        self.formats['normal'] = self.workbook.add_format({
            'align': 'left',
            'valign': 'vcenter',
            'bg_color': COLORS['light'],
            'font_name': 'Helvetica Neue',
            'color': COLORS['dark'],
            'border': 1
        })
        
        # Format monétaire positif
        self.formats['currency_positive'] = self.workbook.add_format({
            'num_format': '#,##0.00 €',
            'align': 'right',
            'bg_color': COLORS['light'],
            'font_name': 'Helvetica Neue',
            'font_color': COLORS['success'],
            'border': 1,
            'bold': True
        })
        
        # Format monétaire négatif
        self.formats['currency_negative'] = self.workbook.add_format({
            'num_format': '#,##0.00 €',
            'align': 'right',
            'bg_color': COLORS['light'],
            'font_name': 'Helvetica Neue',
            'font_color': COLORS['danger'],
            'border': 1,
            'bold': True
        })
        
        # Format monétaire neutre
        self.formats['currency'] = self.workbook.add_format({
            'num_format': '#,##0.00 €',
            'align': 'right',
            'bg_color': COLORS['light'],
            'font_name': 'Helvetica Neue',
            'border': 1
        })
        
        # Format date
        self.formats['date'] = self.workbook.add_format({
            'num_format': 'dd/mm/yyyy',
            'align': 'center',
            'bg_color': COLORS['light'],
            'font_name': 'Helvetica Neue',
            'border': 1
        })
        
        # Format statistique
        self.formats['stat_label'] = self.workbook.add_format({
            'bold': True,
            'align': 'left',
            'valign': 'vcenter',
            'bg_color': '#E8F5E9',
            'font_name': 'Helvetica Neue',
            'border': 1,
            'font_size': 11
        })
        
        self.formats['stat_value'] = self.workbook.add_format({
            'align': 'right',
            'valign': 'vcenter',
            'bg_color': 'white',
            'font_name': 'Helvetica Neue',
            'border': 1,
            'font_size': 11,
            'bold': True
        })

    def create_monthly_sheets(self):
        """Crée un onglet pour chaque mois"""
        for mois, transactions in self.transactions_data.items():
            worksheet = self.workbook.add_worksheet(name=mois[:31])
            
            # Titre du mois
            worksheet.merge_range('A1:E1', f'📊 {mois} - Transactions', self.formats['title'])
            worksheet.set_row(0, 30)
            
            # En-têtes
            headers = ["📝 Titre", "🏷️ Catégorie", "💰 Montant", "📅 Date", "🆔 ID"]
            worksheet.write_row(2, 0, headers, self.formats['header'])
            worksheet.set_row(2, 25)
            
            # Données des transactions
            for row_idx, trans in enumerate(transactions, start=3):
                worksheet.write(row_idx, 0, trans['title'], self.formats['normal'])
                worksheet.write(row_idx, 1, trans['category'], self.formats['normal'])
                
                # Formatage conditionnel pour les montants
                amount_format = self.formats['currency_positive'] if trans['amount'] >= 0 else self.formats['currency_negative']
                worksheet.write(row_idx, 2, trans['amount'], amount_format)
                
                worksheet.write(row_idx, 3, trans['date'], self.formats['date'])
                worksheet.write(row_idx, 4, trans['id'], self.formats['normal'])
            
            # Formatage des colonnes
            worksheet.set_column('A:A', 35)
            worksheet.set_column('B:B', 20)
            worksheet.set_column('C:C', 15)
            worksheet.set_column('D:D', 15)
            worksheet.set_column('E:E', 38)
            
            # Statistiques et graphiques
            self._add_monthly_analytics(worksheet, mois, transactions)

    def _add_monthly_analytics(self, worksheet, mois, transactions):
        """Ajoute les analyses mensuelles"""
        # Calcul des totaux par catégorie
        categorie_totaux = defaultdict(float)
        for trans in transactions:
            categorie_totaux[trans['category']] += abs(trans['amount'])

        categories = list(categorie_totaux.keys())
        valeurs = list(categorie_totaux.values())

        if not categories:
            return

        start_row = len(transactions) + 5
        
        # Section catégories
        worksheet.merge_range(start_row, 6, start_row, 7, 
                             f"📊 Répartition par Catégorie", 
                             self.formats['subheader'])
        
        worksheet.write(start_row + 1, 6, "Catégorie", self.formats['header'])
        worksheet.write(start_row + 1, 7, "Montant", self.formats['header'])
        
        for idx, (categorie, valeur) in enumerate(zip(categories, valeurs)):
            worksheet.write(start_row + 2 + idx, 6, categorie, self.formats['normal'])
            worksheet.write(start_row + 2 + idx, 7, valeur, self.formats['currency'])
        
        # Bilan mensuel
        worksheet.merge_range(start_row, 9, start_row, 11, 
                             f"💼 Bilan du Mois", 
                             self.formats['subheader'])
        
        worksheet.write(start_row + 1, 9, "💸 Total Dépenses", self.formats['header'])
        worksheet.write(start_row + 1, 10, "💵 Total Revenus", self.formats['header'])
        worksheet.write(start_row + 1, 11, "⚖️ Balance", self.formats['header'])
        
        total_depenses = sum(t['amount'] for t in transactions if t['amount'] < 0)
        total_revenus = sum(t['amount'] for t in transactions if t['amount'] > 0)
        balance = total_revenus + total_depenses
        
        worksheet.write(start_row + 2, 9, abs(total_depenses), self.formats['currency_negative'])
        worksheet.write(start_row + 2, 10, total_revenus, self.formats['currency_positive'])
        
        balance_format = self.formats['currency_positive'] if balance >= 0 else self.formats['currency_negative']
        worksheet.write(start_row + 2, 11, balance, balance_format)
        
        # Graphique
        self._create_category_chart(worksheet, mois, categories, valeurs, start_row, 'G3')

    def _create_category_chart(self, worksheet, mois, categories, valeurs, data_row, position):
        """Crée un graphique moderne pour les catégories"""
        chart = self.workbook.add_chart({'type': 'doughnut'})
        
        end_row = data_row + 1 + len(categories)
        
        chart.add_series({
            'name': f"Dépenses - {mois}",
            'categories': [worksheet.get_name(), data_row + 2, 6, end_row, 6],
            'values': [worksheet.get_name(), data_row + 2, 7, end_row, 7],
            'data_labels': {
                'percentage': True,
                'position': 'best_fit',
                'font': {'name': 'Helvetica Neue', 'size': 10, 'bold': True, 'color': COLORS['dark']},
            },
            'points': [{'fill': {'color': color}} for color in COLORS['chart_colors'][:len(categories)]],
        })
        
        chart.set_title({
            'name': f"📊 {mois} - Répartition des Dépenses",
            'name_font': {'bold': True, 'size': 14, 'color': COLORS['primary'], 'name': 'Helvetica Neue'},
        })
        
        chart.set_chartarea({
            'border': {'color': COLORS['accent'], 'width': 2},
            'fill': {'color': 'white'},
        })
        
        chart.set_style(10)
        chart.set_size({'width': 480, 'height': 360})
        
        worksheet.insert_chart(position, chart)

    def create_subscriptions_sheet(self):
        """Crée l'onglet des abonnements"""
        if not self.subscriptions_data:
            return

        worksheet = self.workbook.add_worksheet("💳 Abonnements")
        
        # Titre
        worksheet.merge_range('A1:F1', '💳 Gestion des Abonnements', self.formats['title'])
        worksheet.set_row(0, 30)
        
        # En-têtes
        headers = ["📌 Label", "💰 Montant", "📅 Date", "🔄 Récurrence", "⭐ Note", "🆔 ID"]
        worksheet.write_row(2, 0, headers, self.formats['header'])
        worksheet.set_row(2, 25)
        
        # Données
        total_mensuel = 0
        for row_idx, sub in enumerate(self.subscriptions_data, start=3):
            worksheet.write(row_idx, 0, sub['label'], self.formats['normal'])
            worksheet.write(row_idx, 1, float(sub['amount']), self.formats['currency'])
            worksheet.write(row_idx, 2, sub['date'], self.formats['date'])
            worksheet.write(row_idx, 3, sub['recurrence'], self.formats['normal'])
            worksheet.write(row_idx, 4, sub['rating'], self.formats['normal'])
            worksheet.write(row_idx, 5, str(sub['id']), self.formats['normal'])
            
            if sub['recurrence'].lower() == 'mensuel':
                total_mensuel += float(sub['amount'])
        
        # Formatage
        worksheet.set_column('A:A', 35)
        worksheet.set_column('B:B', 15)
        worksheet.set_column('C:C', 15)
        worksheet.set_column('D:D', 15)
        worksheet.set_column('E:E', 10)
        worksheet.set_column('F:F', 38)
        
        # Statistiques
        start_row = len(self.subscriptions_data) + 5
        worksheet.merge_range(start_row, 0, start_row, 1, 
                             "📊 Statistiques d'Abonnements", 
                             self.formats['subheader'])
        
        worksheet.write(start_row + 1, 0, "Total Mensuel Récurrent", self.formats['stat_label'])
        worksheet.write(start_row + 1, 1, f"{total_mensuel:.2f} €", self.formats['stat_value'])
        
        worksheet.write(start_row + 2, 0, "Nombre d'Abonnements Actifs", self.formats['stat_label'])
        worksheet.write(start_row + 2, 1, len(self.subscriptions_data), self.formats['stat_value'])
        
        # Graphique
        self._create_subscriptions_chart(worksheet, start_row)

    def _create_subscriptions_chart(self, worksheet, data_start_row):
        """Crée le graphique des abonnements"""
        recurrence_totals = defaultdict(float)
        for sub in self.subscriptions_data:
            recurrence_totals[sub['recurrence']] += float(sub['amount'])
        
        recurrences = list(recurrence_totals.keys())
        amounts = list(recurrence_totals.values())
        
        if not recurrences:
            return
        
        # Écrire les données
        start_row = data_start_row + 5
        worksheet.write(start_row, 3, "Type", self.formats['header'])
        worksheet.write(start_row, 4, "Montant Total", self.formats['header'])
        
        for idx, (recurrence, amount) in enumerate(zip(recurrences, amounts)):
            worksheet.write(start_row + 1 + idx, 3, recurrence, self.formats['normal'])
            worksheet.write(start_row + 1 + idx, 4, amount, self.formats['currency'])
        
        # Graphique
        chart = self.workbook.add_chart({'type': 'pie'})
        chart.add_series({
            'name': 'Abonnements par Type',
            'categories': [worksheet.get_name(), start_row + 1, 3, start_row + len(recurrences), 3],
            'values': [worksheet.get_name(), start_row + 1, 4, start_row + len(recurrences), 4],
            'data_labels': {
                'percentage': True,
                'value': True,
                'font': {'name': 'Helvetica Neue', 'size': 10, 'bold': True}
            },
            'points': [{'fill': {'color': COLORS['chart_colors'][i % len(COLORS['chart_colors'])]}} 
                      for i in range(len(recurrences))],
        })
        
        chart.set_title({
            'name': '💳 Répartition des Abonnements par Type',
            'name_font': {'bold': True, 'size': 14, 'color': COLORS['primary'], 'name': 'Helvetica Neue'}
        })
        
        chart.set_style(10)
        chart.set_size({'width': 480, 'height': 360})
        
        worksheet.insert_chart('G3', chart)

    def create_summary_sheet(self):
        """Crée l'onglet de synthèse"""
        worksheet = self.workbook.add_worksheet("📈 SYNTHÈSE")
        
        # Titre principal avec date
        date_rapport = datetime.now().strftime("%d/%m/%Y à %H:%M")
        worksheet.merge_range('A1:G1', 
                             f'📊 SYNTHÈSE FINANCIÈRE COMPLÈTE', 
                             self.formats['title'])
        worksheet.merge_range('A2:G2', 
                             f'Généré le {date_rapport}', 
                             self.formats['header'])
        worksheet.set_row(0, 35)
        worksheet.set_row(1, 20)
        
        # Statistiques globales
        self._add_comprehensive_stats(worksheet)
        
        # Graphiques de tendance
        self._add_trend_analysis(worksheet)

    def _add_comprehensive_stats(self, worksheet):
        """Ajoute des statistiques complètes"""
        all_transactions = []
        for transactions in self.transactions_data.values():
            all_transactions.extend(transactions)
        
        if not all_transactions:
            return
        
        total_depenses = sum(t['amount'] for t in all_transactions if t['amount'] < 0)
        total_revenus = sum(t['amount'] for t in all_transactions if t['amount'] > 0)
        balance_finale = total_revenus + total_depenses
        
        avg_depense = abs(total_depenses) / len([t for t in all_transactions if t['amount'] < 0]) if any(t['amount'] < 0 for t in all_transactions) else 0
        avg_revenu = total_revenus / len([t for t in all_transactions if t['amount'] > 0]) if any(t['amount'] > 0 for t in all_transactions) else 0
        
        # Titre de section
        worksheet.merge_range('A4:B4', '💼 VUE D\'ENSEMBLE FINANCIÈRE', self.formats['subheader'])
        
        stats = [
            ("💵 Total des Revenus", f"{total_revenus:,.2f} €", self.formats['currency_positive']),
            ("💸 Total des Dépenses", f"{abs(total_depenses):,.2f} €", self.formats['currency_negative']),
            ("⚖️ Balance Finale", f"{balance_finale:,.2f} €", 
             self.formats['currency_positive'] if balance_finale >= 0 else self.formats['currency_negative']),
            ("📊 Nombre de Transactions", str(len(all_transactions)), self.formats['stat_value']),
            ("💳 Nombre d'Abonnements", str(len(self.subscriptions_data)), self.formats['stat_value']),
            ("📉 Dépense Moyenne", f"{avg_depense:,.2f} €", self.formats['stat_value']),
            ("📈 Revenu Moyen", f"{avg_revenu:,.2f} €", self.formats['stat_value']),
        ]
        
        row = 5
        for label, value, value_format in stats:
            worksheet.write(row, 0, label, self.formats['stat_label'])
            worksheet.write(row, 1, value, value_format)
            row += 1
        
        worksheet.set_column('A:A', 30)
        worksheet.set_column('B:B', 20)

    def _add_trend_analysis(self, worksheet):
        """Ajoute l'analyse de tendance mensuelle"""
        months = sorted(self.transactions_data.keys(), 
                       key=lambda x: list(MOIS_TRADUCTION.values()).index(x))
        
        if not months:
            return
        
        # Préparer les données
        depenses_mensuelles = []
        revenus_mensuels = []
        balances_mensuelles = []
        
        for mois in months:
            transactions = self.transactions_data[mois]
            depenses = abs(sum(t['amount'] for t in transactions if t['amount'] < 0))
            revenus = sum(t['amount'] for t in transactions if t['amount'] > 0)
            balance = revenus - depenses
            
            depenses_mensuelles.append(depenses)
            revenus_mensuels.append(revenus)
            balances_mensuelles.append(balance)
        
        # Tableau de données
        start_row = 15
        worksheet.merge_range(start_row - 1, 0, start_row - 1, 3,
                             "📊 ÉVOLUTION MENSUELLE", 
                             self.formats['subheader'])
        
        headers = ["📅 Mois", "💸 Dépenses", "💵 Revenus", "⚖️ Balance"]
        for col, header in enumerate(headers):
            worksheet.write(start_row, col, header, self.formats['header'])
        
        for i, mois in enumerate(months):
            worksheet.write(start_row + 1 + i, 0, mois, self.formats['normal'])
            worksheet.write(start_row + 1 + i, 1, depenses_mensuelles[i], self.formats['currency_negative'])
            worksheet.write(start_row + 1 + i, 2, revenus_mensuels[i], self.formats['currency_positive'])
            
            balance_format = self.formats['currency_positive'] if balances_mensuelles[i] >= 0 else self.formats['currency_negative']
            worksheet.write(start_row + 1 + i, 3, balances_mensuelles[i], balance_format)
        
        # Graphique combiné
        self._create_trend_chart(worksheet, months, depenses_mensuelles, revenus_mensuels, start_row)

    def _create_trend_chart(self, worksheet, months, depenses, revenus, data_row):
        """Crée un graphique de tendance sophistiqué"""
        chart = self.workbook.add_chart({'type': 'column', 'subtype': 'stacked'})
        
        end_row = data_row + len(months)
        
        chart.add_series({
            'name': '💸 Dépenses',
            'categories': [worksheet.get_name(), data_row + 1, 0, end_row, 0],
            'values': [worksheet.get_name(), data_row + 1, 1, end_row, 1],
            'fill': {'color': COLORS['danger']},
            'data_labels': {'value': True, 'font': {'bold': True, 'size': 9}}
        })
        
        chart.add_series({
            'name': '💵 Revenus',
            'categories': [worksheet.get_name(), data_row + 1, 0, end_row, 0],
            'values': [worksheet.get_name(), data_row + 1, 2, end_row, 2],
            'fill': {'color': COLORS['success']},
            'data_labels': {'value': True, 'font': {'bold': True, 'size': 9}}
        })
        
        chart.set_title({
            'name': '📈 Évolution Mensuelle - Revenus vs Dépenses',
            'name_font': {'bold': True, 'size': 16, 'color': COLORS['primary'], 'name': 'Helvetica Neue'}
        })
        
        chart.set_x_axis({
            'name': 'Mois',
            'name_font': {'bold': True, 'size': 11},
        })
        
        chart.set_y_axis({
            'name': 'Montant (€)',
            'name_font': {'bold': True, 'size': 11},
        })
        
        chart.set_legend({'position': 'top', 'font': {'bold': True, 'size': 10}})
        chart.set_style(11)
        chart.set_size({'width': 720, 'height': 450})
        
        worksheet.insert_chart('E4', chart)

    def generate_report(self):
        """Génère le rapport complet"""
        print("\n" + "="*60)
        print("🚀 GÉNÉRATEUR DE RAPPORT FINANCIER".center(60))
        print("="*60 + "\n")
        
        # Récupération des données
        print("📊 Récupération des données...")
        transactions_df = self.fetch_transactions()
        subscriptions_df = self.fetch_subscriptions()
        
        if not self.transactions_data and not self.subscriptions_data:
            self._print_error("Aucune donnée à exporter")
            return
        
        # Création du fichier
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"rapport_financier_{timestamp}.xlsx"
        
        print(f"\n📄 Création du fichier: {filename}")
        self.workbook = xlsxwriter.Workbook(filename)
        self.initialize_formats()
        
        # Génération des onglets
        if self.transactions_data:
            print("📅 Génération des onglets mensuels...")
            self.create_monthly_sheets()
            print("📈 Création de la synthèse globale...")
            self.create_summary_sheet()
        
        if self.subscriptions_data:
            print("💳 Création de l'onglet abonnements...")
            self.create_subscriptions_sheet()
        
        # Finalisation
        self.workbook.close()
        
        print("\n" + "="*60)
        print("✅ RAPPORT GÉNÉRÉ AVEC SUCCÈS".center(60))
        print("="*60)
        print(f"\n📁 Fichier: {filename}")
        print("\n📋 Contenu du rapport:")
        print("   ✓ Onglets mensuels détaillés avec graphiques")
        print("   ✓ Analyse par catégorie de dépenses")
        print("   ✓ Gestion complète des abonnements")
        print("   ✓ Synthèse financière globale")
        print("   ✓ Graphiques de tendance et statistiques")
        print("   ✓ Formatage conditionnel des montants")
        print("\n" + "="*60 + "\n")

    @staticmethod
    def _print_success(message):
        """Affiche un message de succès"""
        print(f"✅ {message}")
    
    @staticmethod
    def _print_error(message):
        """Affiche un message d'erreur"""
        print(f"❌ {message}")

def main():
    """Fonction principale avec gestion des erreurs améliorée"""
    try:
        print("\n" + "🌟"*30)
        print("     FINANCE EXPORTER - Générateur de Rapports Pro     ".center(60))
        print("🌟"*30 + "\n")
        
        exporter = FinanceExporter()
        exporter.generate_report()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Opération annulée par l'utilisateur")
    except Exception as e:
        print(f"\n\n❌ Erreur critique: {e}")
        print("💡 Veuillez vérifier la connexion à la base de données et réessayer")
    finally:
        print("\n👋 Programme terminé\n")

if __name__ == "__main__":
    main()