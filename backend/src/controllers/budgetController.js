import { sql } from "../config/db.js";

// 🧾 Création d’un nouveau budget
export const createBudget = async (req, res) => {
  const { name, amount, category } = req.body;
  const user_id = req.user.id;

  // Validation des champs
  if (!name || !amount || !category) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Le montant doit être un nombre positif.' });
  }

  // Conversion explicite du montant en nombre à deux décimales
  const amountNum = parseFloat(amount).toFixed(2);
  
  try {
    const newBudget = await sql`
      INSERT INTO budgets (user_id, name, amount, category) 
      VALUES (${user_id}, ${name}, ${amountNum}, ${category})
      RETURNING *
    `;

    res.status(201).json({
      message: "Budget créé avec succès.",
      budget: newBudget[0]
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du budget :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 🗑️ Suppression d’un budget existant
export const deleteBudget = async (req, res) => {
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

    await sql`DELETE FROM budgets WHERE id = ${budgetId}`;
    
    res.status(200).json({ message: "Budget supprimé avec succès." });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du budget :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 📈 Récupération du nombre de budgets atteints
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

    res.json({ message: `Budgets atteints : ${reachedBudgets}/${totalBudgets}` });
  } catch (error) {
    console.error('❌ Erreur lors du calcul des budgets atteints :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 📊 Récupération du résumé de tous les budgets de l’utilisateur
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
        spent: `${parseFloat(budget.total_spent).toFixed(0)} € dépensé(s)`,
        remaining: `${parseFloat(budget.remaining_amount).toFixed(0)} € restant(s)`
      }
    }));

    res.status(200).json({
      message: "Résumé des budgets récupéré avec succès.",
      budgets: formattedResponse
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du résumé des budgets :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};
