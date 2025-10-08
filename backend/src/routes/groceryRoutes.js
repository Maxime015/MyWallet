import express from 'express';
import {
  getGroceries,
  addGrocery,
  toggleGrocery,
  updateGrocery,
  deleteGrocery,
  getGroceriesSummary,
  clearAllGroceries
} from '../controllers/groceryController.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.get('/', protectRoute, getGroceries);
router.post('/', protectRoute, addGrocery);
router.patch('/:id/toggle', protectRoute, toggleGrocery);
router.put('/:id', protectRoute, updateGrocery);
router.delete('/:id', protectRoute, deleteGrocery);
router.delete('/', protectRoute, clearAllGroceries);
router.get('/summary', protectRoute, getGroceriesSummary);

export default router;

