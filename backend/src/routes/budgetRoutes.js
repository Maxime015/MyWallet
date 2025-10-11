import express from 'express';
import {
  createBudget,
  deleteBudget,
  getReachedBudgets,
  getAllBudgetsSummary
} from '../controllers/budgetController.js';

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.post('/', protectRoute, createBudget);
router.delete('/:budgetId', protectRoute, deleteBudget);
router.get('/reached', protectRoute, getReachedBudgets); // Utilise req.user.id
router.get('/all-summaries', protectRoute, getAllBudgetsSummary); // Utilise req.user.id

export default router;