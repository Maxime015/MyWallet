import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";


const protectRoute = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await sql`
      SELECT id, username, email, profile_image, first_name, last_name, bio, location, created_at 
      FROM users WHERE id = ${decoded.userId}
    `;
    
    if (users.length === 0) return res.status(401).json({ message: "Token is not valid" });

    const user = users[0];
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profile_image,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,           
      location: user.location, 
      createdAt: user.created_at,
    };
    
    next();
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      console.error("Authentication error:", error.message);
      res.status(401).json({ message: "Token is not valid" });
    }
};

export default protectRoute;