import express from 'express';
import {
  createBudget,
  getUserBudgets,
  deleteBudget,
  getReachedBudgets,
  getUserBudgetData,
  getLastBudgets,
  getAllBudgetsSummary
} from '../controllers/budgetController.js';

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.post('/', protectRoute, createBudget);
router.get('/user-budgets', protectRoute, getUserBudgets); // Changé pour ne pas avoir de paramètre
router.delete('/:budgetId', protectRoute, deleteBudget);
router.get('/reached', protectRoute, getReachedBudgets); // Utilise req.user.id
router.get('/data', protectRoute, getUserBudgetData); // Utilise req.user.id
router.get('/last', protectRoute, getLastBudgets); // Utilise req.user.id
router.get('/all-summaries', protectRoute, getAllBudgetsSummary); // Utilise req.user.id

export default router;