import asyncHandler from "express-async-handler";
import { sql } from "../config/db.js";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await sql`
    SELECT 
      c.*,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image,
      COUNT(DISTINCT cl.user_id) as likes_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN comment_likes cl ON c.id = cl.comment_id
    WHERE c.post_id = ${postId}
    GROUP BY c.id, u.id
    ORDER BY c.created_at DESC
  `;

  // Ajouter l'information si l'utilisateur connecté a liké chaque commentaire
  const commentsWithLikes = await Promise.all(
    comments.map(async (comment) => {
      let userLiked = false;
      if (req.user && req.user.id) {
        const like = await sql`
          SELECT 1 FROM comment_likes 
          WHERE comment_id = ${comment.id} AND user_id = ${req.user.id}
          LIMIT 1
        `;
        userLiked = like.length > 0;
      }

      return {
        ...comment,
        likes: comment.likes_count,
        userLiked
      };
    })
  );

  res.status(200).json({ comments: commentsWithLikes });
});

export const createComment = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  // Vérifier si l'utilisateur et le post existent
  const user = await sql`SELECT id FROM users WHERE id = ${user_id}`;
  const post = await sql`SELECT id, user_id FROM posts WHERE id = ${postId}`;

  if (user.length === 0 || post.length === 0) {
    return res.status(404).json({ error: "User or post not found" });
  }

  // Créer le commentaire
  const newComment = await sql`
    INSERT INTO comments (user_id, post_id, content)
    VALUES (${user_id}, ${postId}, ${content.trim()})
    RETURNING *
  `;

  // Récupérer les informations complètes du commentaire avec l'utilisateur
  const commentWithUser = await sql`
    SELECT 
      c.*,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ${newComment[0].id}
  `;

  // Créer une notification si l'utilisateur ne commente pas son propre post
  if (post[0].user_id !== user_id) {
    await sql`
      INSERT INTO notifications (from_user_id, to_user_id, post_id, comment_id, type)
      VALUES (${user_id}, ${post[0].user_id}, ${postId}, ${newComment[0].id}, 'comment')
    `;
  }

  const finalComment = {
    ...commentWithUser[0],
    likes: 0,
    userLiked: false
  };

  res.status(201).json({ comment: finalComment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { commentId } = req.params;

  // Vérifier si le commentaire existe et appartient à l'utilisateur
  const comment = await sql`
    SELECT * FROM comments WHERE id = ${commentId} AND user_id = ${user_id}
  `;

  if (comment.length === 0) {
    return res.status(404).json({ error: "Comment not found or not authorized" });
  }

  // Supprimer les likes et notifications associés au commentaire
  await sql`DELETE FROM comment_likes WHERE comment_id = ${commentId}`;
  await sql`DELETE FROM notifications WHERE comment_id = ${commentId}`;

  // Supprimer le commentaire
  await sql`DELETE FROM comments WHERE id = ${commentId}`;

  res.status(200).json({ message: "Comment deleted successfully" });
});