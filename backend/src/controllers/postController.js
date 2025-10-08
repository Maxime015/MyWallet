import asyncHandler from "express-async-handler";
import { sql } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";


export const getPosts = asyncHandler(async (req, res) => {
  const posts = await sql`
    SELECT 
      p.*,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image,
      COUNT(DISTINCT pl.user_id) as likes_count,
      COUNT(DISTINCT c.id) as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
  `;

  // Récupérer les commentaires pour chaque post
  const postsWithComments = await Promise.all(
    posts.map(async (post) => {
      const comments = await sql`
        SELECT 
          c.*,
          u.username,
          u.first_name,
          u.last_name,
          u.profile_image
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ${post.id}
        ORDER BY c.created_at ASC
      `;

      // Vérifier si l'utilisateur connecté a liké le post
      let userLiked = false;
      if (req.user && req.user.id) {
        const like = await sql`
          SELECT 1 FROM post_likes 
          WHERE post_id = ${post.id} AND user_id = ${req.user.id}
          LIMIT 1
        `;
        userLiked = like.length > 0;
      }

      return {
        ...post,
        likes: post.likes_count,
        comments: comments,
        userLiked
      };
    })
  );

  res.status(200).json({ posts: postsWithComments });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const posts = await sql`
    SELECT 
      p.*,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image,
      COUNT(DISTINCT pl.user_id) as likes_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    WHERE p.id = ${postId}
    GROUP BY p.id, u.id
  `;

  if (posts.length === 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = posts[0];

  // Récupérer les commentaires
  const comments = await sql`
    SELECT 
      c.*,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ${postId}
    ORDER BY c.created_at ASC
  `;

  // Vérifier si l'utilisateur connecté a liké le post
  let userLiked = false;
  if (req.user && req.user.id) {
    const like = await sql`
      SELECT 1 FROM post_likes 
      WHERE post_id = ${postId} AND user_id = ${req.user.id}
      LIMIT 1
    `;
    userLiked = like.length > 0;
  }

  const postWithDetails = {
    ...post,
    likes: post.likes_count,
    comments: comments,
    userLiked
  };

  res.status(200).json({ post: postWithDetails });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await sql`
    SELECT id FROM users WHERE username = ${username}
  `;

  if (user.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const userId = user[0].id;

  const posts = await sql`
    SELECT 
      p.*,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image,
      COUNT(DISTINCT pl.user_id) as likes_count,
      COUNT(DISTINCT c.id) as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.user_id = ${userId}
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
  `;

  const postsWithDetails = await Promise.all(
    posts.map(async (post) => {
      const comments = await sql`
        SELECT 
          c.*,
          u.username,
          u.first_name,
          u.last_name,
          u.profile_image
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ${post.id}
        ORDER BY c.created_at ASC
      `;

      let userLiked = false;
      if (req.user && req.user.id) {
        const like = await sql`
          SELECT 1 FROM post_likes 
          WHERE post_id = ${post.id} AND user_id = ${req.user.id}
          LIMIT 1
        `;
        userLiked = like.length > 0;
      }

      return {
        ...post,
        likes: post.likes_count,
        comments: comments,
        userLiked
      };
    })
  );

  res.status(200).json({ posts: postsWithDetails });
});

export const createPost = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { title, content } = req.body;
  const imageFile = req.file;

  if (!title && !content && !imageFile) {
    return res.status(400).json({ error: "Post must contain either title, text or image" });
  }

  let imageUrl = "";

  // Upload image to Cloudinary if provided
  if (imageFile) {
    try {
      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        if (uploadError.http_code === 400) {
          return res.status(400).json({ error: "Invalid image format" });
        }
        return res.status(500).json({ error: "Image upload service unavailable" });
      }
  }

  const newPost = await sql`
    INSERT INTO posts (user_id, title, content, image)
    VALUES (${user_id}, ${title || null}, ${content || ""}, ${imageUrl})
    RETURNING *
  `;

  // Récupérer les informations utilisateur pour la réponse
  const user = await sql`
    SELECT username, first_name, last_name, profile_image 
    FROM users WHERE id = ${user_id}
  `;

    const postWithUser = {
      ...newPost[0],
      username: user[0].username,
      firstName: user[0].first_name,   
      lastName: user[0].last_name,      
      profileImage: user[0].profile_image, 
      likes: 0,
      comments: [],
      userLiked: false
  };

  res.status(201).json({ post: postWithUser });
});

export const likePost = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { postId } = req.params;

  // Vérifier si le post existe
  const post = await sql`SELECT * FROM posts WHERE id = ${postId}`;
  if (post.length === 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Vérifier si l'utilisateur a déjà liké le post
  const existingLike = await sql`
    SELECT * FROM post_likes 
    WHERE post_id = ${postId} AND user_id = ${user_id}
  `;

  if (existingLike.length > 0) {
    // Unlike
    await sql`
      DELETE FROM post_likes 
      WHERE post_id = ${postId} AND user_id = ${user_id}
    `;
  } else {
    // Like
    await sql`
      INSERT INTO post_likes (user_id, post_id)
      VALUES (${user_id}, ${postId})
    `;

    // Créer une notification si l'utilisateur ne like pas son propre post
    if (post[0].user_id !== user_id) {
      await sql`
        INSERT INTO notifications (from_user_id, to_user_id, post_id, type)
        VALUES (${user_id}, ${post[0].user_id}, ${postId}, 'like')
      `;
    }
  }

  res.status(200).json({
    message: existingLike.length > 0 ? "Post unliked successfully" : "Post liked successfully",
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { postId } = req.params;

  // Vérifier si le post existe et appartient à l'utilisateur
  const post = await sql`
    SELECT * FROM posts WHERE id = ${postId} AND user_id = ${user_id}
  `;

  if (post.length === 0) {
    return res.status(404).json({ error: "Post not found or not authorized" });
  }

  // Supprimer les commentaires, likes et notifications associés
  await sql`DELETE FROM comments WHERE post_id = ${postId}`;
  await sql`DELETE FROM post_likes WHERE post_id = ${postId}`;
  await sql`DELETE FROM notifications WHERE post_id = ${postId}`;

  // Supprimer le post
  await sql`DELETE FROM posts WHERE id = ${postId}`;

  res.status(200).json({ message: "Post deleted successfully" });
});