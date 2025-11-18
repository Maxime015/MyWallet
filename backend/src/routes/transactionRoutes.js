import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getSummaryByUserId,
  getTransactionsByUserId,
} from "../controllers/transactionController.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Toutes les routes utilisent maintenant le middleware d'authentification
router.get("/", protectRoute, getTransactionsByUserId);
router.post("/", protectRoute, createTransaction);
router.delete("/:id", protectRoute, deleteTransaction);
router.get("/summary", protectRoute, getSummaryByUserId);

export default router;