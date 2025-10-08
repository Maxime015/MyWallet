import { sql } from "../config/db.js";

export const createBudget = async (req, res) => {
  const { name, amount, category } = req.body;
  const user_id = req.user.id;

  // Validation
  if (!name || !amount || !category) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Le montant doit être un nombre positif' });
  }

  // Convertir explicitement
  const amountNum = parseFloat(amount).toFixed(2);
  
  try {
    const newBudget = await sql`
      INSERT INTO budgets (user_id, name, amount, category) 
      VALUES (${user_id}, ${name}, ${amountNum}, ${category})
      RETURNING *
    `;

    res.status(201).json({
      message: "Budget created successfully",
      budget: newBudget[0]
    });

  } catch (error) {
    console.error('Erreur création budget:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUserBudgets = async (req, res) => {
  const user_id = req.user.id; // Récupéré du token

  try {
    const budgets = await sql`
      SELECT b.*, 
        COALESCE(SUM(t.amount), 0) as total_transactions,
        COUNT(t.id) as transaction_count
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;

    res.json(budgets);
  } catch (error) {
    console.error('Erreur récupération budgets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteBudget = async (req, res) => {
  const { budgetId } = req.params;
  const user_id = req.user.id;

  try {
    // Vérifier que le budget appartient à l'utilisateur avant suppression
    const budgetCheck = await sql`
      SELECT id FROM budgets WHERE id = ${budgetId} AND user_id = ${user_id}
    `;
    
    if (budgetCheck.length === 0) {
      return res.status(404).json({ error: 'Budget non trouvé ou non autorisé' });
    }

    await sql`DELETE FROM budgets WHERE id = ${budgetId}`;
    
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error('Erreur suppression budget:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getReachedBudgets = async (req, res) => {
  const user_id = req.user.id;

  try {
    const budgets = await sql`
      SELECT b.*, 
        COALESCE(SUM(t.amount), 0) as total_transactions
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      GROUP BY b.id
    `;

    const totalBudgets = budgets.length;
    const reachedBudgets = budgets.filter(budget => 
      parseFloat(budget.total_transactions) >= parseFloat(budget.amount)
    ).length;

    res.json(`${reachedBudgets}/${totalBudgets}`);
  } catch (error) {
    console.error('Erreur calcul budgets atteints:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUserBudgetData = async (req, res) => {
  const user_id = req.user.id;

  try {
    const data = await sql`
      SELECT 
        b.name,
        b.amount as total_budget_amount,
        COALESCE(SUM(t.amount), 0) as total_transactions_amount,
        b.category
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      GROUP BY b.id, b.name, b.amount, b.category
    `;

    res.json(data);
  } catch (error) {
    console.error('Erreur données budgétaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getLastBudgets = async (req, res) => {
  const user_id = req.user.id;

  try {
    const budgets = await sql`
      SELECT b.*,
        COALESCE(SUM(t.amount), 0) as total_transactions
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT 3
    `;

    res.json(budgets);
  } catch (error) {
    console.error('Erreur derniers budgets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllBudgetsSummary = async (req, res) => {
  const user_id = req.user.id;

  try {
    const budgetsSummary = await sql`
      SELECT 
        b.id,
        b.name,
        b.amount as budget_total,
        b.category,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_spent,
        (b.amount - COALESCE(SUM(t.amount), 0)) as remaining_amount,
        CASE 
          WHEN b.amount > 0 THEN 
            ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 2)
          ELSE 0 
        END as percentage_used
      FROM budgets b
      LEFT JOIN transactions t ON t.budget_id = b.id
      WHERE b.user_id = ${user_id}
      GROUP BY b.id, b.name, b.amount, b.category
      ORDER BY b.created_at DESC
    `;

    const formattedResponse = budgetsSummary.map(budget => ({
      budget_id: budget.id,
      budget_name: budget.name,
      transaction_count: parseInt(budget.transaction_count),
      total_spent: parseFloat(budget.total_spent),
      budget_total: parseFloat(budget.budget_total),
      remaining_amount: parseFloat(budget.remaining_amount),
      percentage_used: parseFloat(budget.percentage_used),
      display: {
        title: budget.name,
        transaction_count: `${budget.transaction_count} transaction(s)`,
        amounts: `${parseFloat(budget.total_spent).toFixed(0)} € / ${parseFloat(budget.budget_total).toFixed(0)} €`,
        spent: `${parseFloat(budget.total_spent).toFixed(0)} € dépensés`,
        remaining: `${parseFloat(budget.remaining_amount).toFixed(0)} € restants`
      }
    }));

    res.json(formattedResponse);
  } catch (error) {
    console.error('Erreur récupération résumé tous les budgets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};