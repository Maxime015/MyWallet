import express from "express";
import { 
  register, 
  login, 
  getAllProfileImages,
  getUserProfile,
  updateProfile,
  getCurrentUser,
  followUser
} from "../controllers/authController.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile-images", getAllProfileImages);
router.get("/profile/:username", getUserProfile); // Route publique pour voir les profils

// Protected routes
router.get("/me", protectRoute, getCurrentUser); // Récupérer l'utilisateur connecté
router.put("/profile", protectRoute, updateProfile); // Mettre à jour le profil
router.post("/follow/:targetUserId", protectRoute, followUser); // Suivre/unfollow un utilisateur

export default router;
