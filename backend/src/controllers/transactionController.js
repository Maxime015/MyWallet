import { sql } from "../config/db.js";

export const createTransaction = async (req, res) => {
  const { budget_id, amount, description, category } = req.body;
  const user_id = req.user.id;

  try {
    // Vérifier que le budget appartient à l'utilisateur
    const budgetResult = await sql`
      SELECT b.*, 
        COALESCE(SUM(t.amount), 0) as total_transactions
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.id = ${budget_id} AND b.user_id = ${user_id}
      GROUP BY b.id
    `;
    if (budgetResult.length === 0) {
      return res.status(404).json({ error: 'Budget non trouvé' });
    }

    const budget = budgetResult[0];
    const totalWithNewTransaction = parseFloat(budget.total_transactions) + parseFloat(amount);

    if (totalWithNewTransaction > budget.amount) {
      return res.status(400).json({ error: 'Le montant dépasse le budget' });
    }

    // Créer la transaction
    const newTransaction = await sql`
      INSERT INTO transactions (user_id, budget_id, description, amount, category) 
      VALUES (${user_id}, ${budget_id}, ${description}, ${amount}, ${category})
      RETURNING *
    `;

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction[0]
    });
  } catch (error) {
    console.error('Erreur création transaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

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

    res.status(200).json(transactions);

  } catch (error) {
    console.log('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getBudgetTransactions = async (req, res) => {
  const { budgetId } = req.params;
  const user_id = req.user.id;

  try {
    // Vérifier que le budget appartient à l'utilisateur
    const budgetCheck = await sql`
      SELECT id FROM budgets WHERE id = ${budgetId} AND user_id = ${user_id}
    `;
    
    if (budgetCheck.length === 0) {
      return res.status(404).json({ error: 'Budget non trouvé ou non autorisé' });
    }

    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE budget_id = ${budgetId} 
      ORDER BY created_at DESC
    `;

    res.json(transactions);
  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const user_id = req.user.id;

  try {
    // Vérifier que la transaction appartient à l'utilisateur
    const transactionCheck = await sql`
      SELECT t.id 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE t.id = ${transactionId} AND b.user_id = ${user_id}
    `;
    
    if (transactionCheck.length === 0) {
      return res.status(404).json({ error: 'Transaction non trouvée ou non autorisée' });
    }

    await sql`DELETE FROM transactions WHERE id = ${transactionId}`;

    res.status(200).json({message: "Transaction deleted successfully"});
  } catch (error) {
    console.error('Erreur suppression transaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getTransactionsByPeriod = async (req, res) => {
  const { period } = req.params;
  const user_id = req.user.id;

  try {
    let dateLimit = new Date();
    switch (period) {
      case 'last7': dateLimit.setDate(dateLimit.getDate() - 7); break;
      case 'last30': dateLimit.setDate(dateLimit.getDate() - 30); break;
      case 'last90': dateLimit.setDate(dateLimit.getDate() - 90); break;
      case 'last365': dateLimit.setFullYear(dateLimit.getFullYear() - 1); break;
      default: return res.status(400).json({ error: 'Période invalide. Utiliser: last7, last30, last90, last365' });
    }

    const transactions = await sql`
      SELECT t.*, b.name as budget_name, b.user_id
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      AND t.created_at >= ${dateLimit.toISOString()}
      ORDER BY t.created_at DESC
    `;

    res.json(transactions);
  } catch (error) {
    console.error('Erreur transactions par période:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getTotalAmount = async (req, res) => {
  const user_id = req.user.id;

  try {
    const totalResult = await sql`
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
    `;

    res.json(parseFloat(totalResult[0].total));
  } catch (error) {
    console.error('Erreur montant total:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getTotalCount = async (req, res) => {
  const user_id = req.user.id;

  try {
    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
    `;

    res.json(parseInt(countResult[0].count));
  } catch (error) {
    console.error('Erreur comptage transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getLastTransactions = async (req, res) => {
  const user_id = req.user.id;

  try {
    const transactions = await sql`
      SELECT t.*, b.name as budget_name
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    res.json(transactions);
  } catch (error) {
    console.error('Erreur dernières transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export async function getSummary(req, res) {
  try {
    const user_id = req.user.id; // Récupéré du middleware d'authentification

    // Récupérer le solde total (somme de tous les montants de transactions)
    const balanceResult = await sql`
      SELECT COALESCE(SUM(t.amount), 0) as balance 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
    `;

    // Récupérer les revenus (transactions positives)
    const incomeResult = await sql`
      SELECT COALESCE(SUM(t.amount), 0) as income 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id} AND t.amount > 0
    `;

    // Récupérer les dépenses (transactions négatives, converties en positif)
    const expensesResult = await sql`
      SELECT COALESCE(ABS(SUM(t.amount)), 0) as expenses 
      FROM transactions t
      JOIN budgets b ON t.budget_id = b.id
      WHERE b.user_id = ${user_id} AND t.amount < 0
    `;

    res.status(200).json({
      balance: parseFloat(balanceResult[0].balance),
      income: parseFloat(incomeResult[0].income),
      expenses: parseFloat(expensesResult[0].expenses)
    });

  } catch (error) {
    console.log('Error fetching summary', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}