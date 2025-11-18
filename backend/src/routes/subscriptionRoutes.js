import express from 'express';
import { 
  createSubscription, 
  deleteSubscription, 
  getSummaryByUserId, 
  getSubscriptionByUserId } from '../controllers/subscriptionController.js';

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes corrigées - utilisation cohérente de req.user.id
router.get('/', protectRoute, getSubscriptionByUserId);
router.post('/', protectRoute, createSubscription);
router.delete('/:id', protectRoute, deleteSubscription);
router.get('/summary', protectRoute, getSummaryByUserId);

export default router;
