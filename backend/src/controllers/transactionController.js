import { sql } from "../config/db.js";

// 💸 Création d'une transaction
export const createTransaction = async (req, res) => {
  const { budget_id, amount, description } = req.body;
  const user_id = req.user.id;

  // Validation des champs requis
  if (!budget_id || !amount || !description) {
    return res.status(400).json({ error: 'Tous les champs sont requis (budget_id, montant, description).' });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Le montant doit être un nombre positif.' });
  }

  try {
    // Récupérer le budget et ses transactions
    const budgetResult = await sql`
      SELECT b.*, 
        COALESCE(SUM(t.amount), 0) as total_transactions
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.id = ${budget_id} AND b.user_id = ${user_id}
      GROUP BY b.id
    `;

    if (budgetResult.length === 0) {
      return res.status(404).json({ error: 'Budget introuvable.' });
    }

    const budget = budgetResult[0];
    const totalWithNewTransaction = parseFloat(budget.total_transactions) + parseFloat(amount);

    // Vérifier si le montant dépasse le budget alloué
    if (totalWithNewTransaction > budget.amount) {
      return res.status(400).json({ 
        error: 'Le montant de la transaction dépasse le budget disponible.',
        details: {
          reste_budget: (budget.amount - budget.total_transactions).toFixed(2),
          montant_saisi: amount
        }
      });
    }

    // Créer la transaction en utilisant la catégorie du budget
    const newTransaction = await sql`
      INSERT INTO transactions (user_id, budget_id, description, amount, category) 
      VALUES (${user_id}, ${budget_id}, ${description}, ${amount}, ${budget.category})
      RETURNING *
    `;

    res.status(201).json({
      message: "Transaction créée avec succès.",
      transaction: newTransaction[0]
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la transaction :', error);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la création de la transaction.' });
  }
};

// 📋 Récupération de toutes les transactions de l’utilisateur
export async function getMyTransactions(req, res) {
  try {
    const user_id = req.user.id;

    const transactions = await sql`
      SELECT t.*, b.name as budget_name
      FROM transactions t
      LEFT JOIN budgets b ON t.budget_id = b.id
      WHERE t.user_id = ${user_id}
      ORDER BY t.created_at DESC
    `;

    res.status(200).json({
      message: "Transactions récupérées avec succès.",
      transactions
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des transactions :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

// 📊 Récupération des transactions associées à un budget spécifique
export const getBudgetTransactions = async (req, res) => {
  const { budgetId } = req.params;
  const user_id = req.user.id;

  try {
    // Vérifier que le budget appartient bien à l’utilisateur
    const budgetCheck = await sql`
      SELECT id FROM budgets WHERE id = ${budgetId} AND user_id = ${user_id}
    `;
    
    if (budgetCheck.length === 0) {
      return res.status(404).json({ error: 'Budget introuvable ou accès non autorisé.' });
    }

    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE budget_id = ${budgetId} 
      ORDER BY created_at DESC
    `;

    res.status(200).json({
      message: "Transactions du budget récupérées avec succès.",
      transactions
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des transactions :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 🗑️ Suppression d’une transaction
export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const user_id = req.user.id;

  try {
    // Vérifier que la transaction appartient à l’utilisateur
    const transactionCheck = await sql`
      SELECT t.id 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE t.id = ${transactionId} AND b.user_id = ${user_id}
    `;
    
    if (transactionCheck.length === 0) {
      return res.status(404).json({ error: 'Transaction introuvable ou accès non autorisé.' });
    }

    await sql`DELETE FROM transactions WHERE id = ${transactionId}`;

    res.status(200).json({ message: "Transaction supprimée avec succès." });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la transaction :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 📈 Résumé global des transactions de l’utilisateur
export async function getSummary(req, res) {
  try {
    const user_id = req.user.id;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(t.amount), 0) as balance 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(t.amount), 0) as income 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id} AND t.amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(ABS(SUM(t.amount)), 0) as expenses 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id} AND t.amount < 0
    `;

    res.status(200).json({
      message: "Résumé financier récupéré avec succès.",
      solde: parseFloat(balanceResult[0].balance),
      revenus: parseFloat(incomeResult[0].income),
      depenses: parseFloat(expensesResult[0].expenses)
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du résumé financier :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}
