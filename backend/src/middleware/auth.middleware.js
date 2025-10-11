import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Aucun jeton d'authentification, accès refusé" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await sql`
      SELECT id, username, email, profile_image, created_at 
      FROM users WHERE id = ${decoded.userId}
    `;
    
    if (users.length === 0) return res.status(401).json({ message: "Le jeton n'est pas valide" });

    const user = users[0];
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profile_image,
      createdAt: user.created_at,
    };
    
    next();
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Le jeton a expiré" });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Jeton invalide" });
      }
      console.error("Erreur d'authentification :", error.message);
      res.status(401).json({ message: "Le jeton n'est pas valide" });
    }
};

export default protectRoute;
