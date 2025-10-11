import express from 'express';
import { 
  createSubscription, 
  deleteSubscription, 
  getSummaryByUserId, 
  getSubscriptionByUserId } from '../controllers/subscriptionController.js';

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes 
router.get('/:userId', protectRoute, getSubscriptionByUserId);
router.post('/', protectRoute, createSubscription);
router.delete('/:id', protectRoute, deleteSubscription);
router.get('/summary/:userId', protectRoute, getSummaryByUserId);

export default router;