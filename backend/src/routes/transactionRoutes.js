import express from 'express';
import {
  createTransaction,
  getMyTransactions,
  getBudgetTransactions,
  deleteTransaction,
  getTransactionsByPeriod,
  getTotalAmount,
  getTotalCount,
  getLastTransactions,
  getSummary
} from '../controllers/transactionController.js';

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.post('/', protectRoute, createTransaction);
router.get('/my-transactions', protectRoute, getMyTransactions); // ✅ Nouvelle route ajoutée
router.get('/budget/:budgetId', protectRoute, getBudgetTransactions);
router.delete('/:transactionId', protectRoute, deleteTransaction);
router.get('/period/:period', protectRoute, getTransactionsByPeriod); // userId vient de req.user
router.get('/total-amount', protectRoute, getTotalAmount); // userId vient de req.user
router.get('/total-count', protectRoute, getTotalCount); // userId vient de req.user
router.get('/last', protectRoute, getLastTransactions); // userId vient de req.user
router.get('/summary', protectRoute, getSummary);

export default router;