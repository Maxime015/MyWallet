import { sql, hashPassword, comparePassword } from '../config/db.js';

import jwt from 'jsonwebtoken';


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

export const register = async (req, res) => {
  try {
    const { email, username, password, first_name, last_name, bio, location } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username should be at least 3 characters long" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} OR username = ${username}
    `;

    if (existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser[0].username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Générer l'avatar et hacher le mot de passe
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = await sql`
      INSERT INTO users (username, email, password, profile_image, first_name, last_name, bio, location) 
      VALUES (${username}, ${email}, ${hashedPassword}, ${profileImage}, ${first_name || ''}, ${last_name || ''}, ${bio || ''}, ${location || ''})
      RETURNING id, username, email, profile_image, first_name, last_name, bio, location, created_at
    `;

    const token = generateToken(newUser[0].id);

    res.status(201).json({
      token,
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        profileImage: newUser[0].profile_image,
        firstName: newUser[0].first_name,
        lastName: newUser[0].last_name,
        bio: newUser[0].bio,
        location: newUser[0].location,
        createdAt: newUser[0].created_at,
      },
    });
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    // Vérifier si l'utilisateur existe
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (users.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];

    // Vérifier le mot de passe
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profile_image,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        location: user.location,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const users = await sql`
      SELECT 
        id, username, email, profile_image, first_name, last_name, bio, location, created_at,
        (SELECT COUNT(*) FROM followers WHERE user_id = users.id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = users.id) as following_count
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Vérifier si l'utilisateur connecté suit cet utilisateur
    let isFollowing = false;
    if (req.user && req.user.id) {
      const follow = await sql`
        SELECT 1 FROM followers 
        WHERE user_id = ${user.id} AND follower_id = ${req.user.id}
        LIMIT 1
      `;
      isFollowing = follow.length > 0;
    }

    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profile_image,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      location: user.location,
      createdAt: user.created_at,
      followersCount: parseInt(user.followers_count),
      followingCount: parseInt(user.following_count),
      isFollowing
    };

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.log("Error in getUserProfile route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { username, email, first_name, last_name, bio, location, profile_image } = req.body;

    if (username && username.length < 3) {
      return res.status(400).json({ message: "Username should be at least 3 characters long" });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Vérifier si le nouveau username ou email est déjà utilisé par un autre utilisateur
    if (username || email) {
      const existingUser = await sql`
        SELECT * FROM users 
        WHERE (email = ${email} OR username = ${username}) AND id != ${user_id}
      `;

      if (existingUser.length > 0) {
        if (existingUser[0].email === email) {
          return res.status(400).json({ message: "Email already exists" });
        }
        if (existingUser[0].username === username) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
    }

    // Mettre à jour le profil
    const updatedUser = await sql`
      UPDATE users 
      SET 
        username = COALESCE(${username}, username),
        email = COALESCE(${email}, email),
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        bio = COALESCE(${bio}, bio),
        location = COALESCE(${location}, location),
        profile_image = COALESCE(${profile_image}, profile_image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user_id}
      RETURNING id, username, email, profile_image, first_name, last_name, bio, location, created_at, updated_at
    `;

    res.status(200).json({
      user: {
        id: updatedUser[0].id,
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        profileImage: updatedUser[0].profile_image,
        firstName: updatedUser[0].first_name,
        lastName: updatedUser[0].last_name,
        bio: updatedUser[0].bio,
        location: updatedUser[0].location,
        createdAt: updatedUser[0].created_at,
        updatedAt: updatedUser[0].updated_at,
      },
    });
  } catch (error) {
    console.log("Error in updateProfile route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // L'utilisateur est déjà dans req.user grâce au middleware d'authentification
    const user = req.user;

    // Récupérer les compteurs de followers/following
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM followers WHERE user_id = ${user.id}) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = ${user.id}) as following_count
    `;

    const userWithCounts = {
      ...user,
      followersCount: parseInt(counts[0].followers_count),
      followingCount: parseInt(counts[0].following_count)
    };

    res.status(200).json({ user: userWithCounts });
  } catch (error) {
    console.log("Error in getCurrentUser route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { targetUserId } = req.params;

    if (user_id.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Vérifier si l'utilisateur cible existe
    const targetUser = await sql`SELECT id FROM users WHERE id = ${targetUserId}`;
    if (targetUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Vérifier si l'utilisateur suit déjà
    const existingFollow = await sql`
      SELECT * FROM followers 
      WHERE user_id = ${targetUserId} AND follower_id = ${user_id}
    `;

    if (existingFollow.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM followers 
        WHERE user_id = ${targetUserId} AND follower_id = ${user_id}
      `;
    } else {
      // Follow
      await sql`
        INSERT INTO followers (user_id, follower_id)
        VALUES (${targetUserId}, ${user_id})
      `;

      // Créer une notification
      await sql`
        INSERT INTO notifications (from_user_id, to_user_id, type)
        VALUES (${user_id}, ${targetUserId}, 'follow')
      `;
    }

    res.status(200).json({
      message: existingFollow.length > 0 ? "User unfollowed successfully" : "User followed successfully",
    });
  } catch (error) {
    console.log("Error in followUser route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProfileImages = async (req, res) => {
  try {
    // Récupérer seulement les images de profil et noms d'utilisateur
    const users = await sql`
      SELECT username, profile_image FROM users
    `;
    
    res.status(200).json({
      users: users.map(user => ({
        username: user.username,
        profileImage: user.profile_image
      }))
    });
  } catch (error) {
    console.log("Error fetching profile images", error);
    res.status(500).json({ message: "Internal server error" });
  }
};