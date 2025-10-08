import express from 'express';
import { 
  createSubscription, 
  deleteSubscription, 
  getSummary, 
  getSubscriptions 
} from '../controllers/subscriptionController.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.get('/', protectRoute, getSubscriptions);
router.post('/', protectRoute, createSubscription);
router.delete('/:id', protectRoute, deleteSubscription);
router.get('/summary', protectRoute, getSummary);

export default router;