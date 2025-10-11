import express from 'express';
import {
  createTransaction,
  getMyTransactions,
  getBudgetTransactions,
  deleteTransaction,
  getSummary
} from '../controllers/transactionController.js';

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.post('/', protectRoute, createTransaction);
router.get('/my-transactions', protectRoute, getMyTransactions); 
router.get('/budget/:budgetId', protectRoute, getBudgetTransactions);
router.delete('/:transactionId', protectRoute, deleteTransaction);
router.get('/summary', protectRoute, getSummary);

export default router;