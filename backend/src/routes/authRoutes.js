import express from "express";
import { 
  register, 
  login, 
  getAllProfileImages,
} from "../controllers/authController.js";

import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.get("/profile-images", protectRoute, getAllProfileImages);

export default router;
