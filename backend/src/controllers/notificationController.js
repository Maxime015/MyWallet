import asyncHandler from "express-async-handler";
import { sql } from "../config/db.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const user_id = req.user.id;

  const notifications = await sql`
    SELECT 
      n.*,
      from_user.username as from_username,
      from_user.first_name as from_first_name,
      from_user.last_name as from_last_name,
      from_user.profile_image as from_profile_image,
      p.title as post_title,
      p.content as post_content,
      p.image as post_image,
      c.content as comment_content
    FROM notifications n
    JOIN users from_user ON n.from_user_id = from_user.id
    LEFT JOIN posts p ON n.post_id = p.id
    LEFT JOIN comments c ON n.comment_id = c.id
    WHERE n.to_user_id = ${user_id}
    ORDER BY n.created_at DESC
  `;

  // Formater la réponse pour correspondre à l'ancienne structure
  const formattedNotifications = notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    createdAt: notification.created_at,
    from: {
      username: notification.from_username,
      first_name: notification.from_first_name,
      last_name: notification.from_last_name,
      profile_image: notification.from_profile_image
    },
    post: notification.post_id ? {
      title: notification.post_title,
      content: notification.post_content,
      image: notification.post_image
    } : null,
    comment: notification.comment_id ? {
      content: notification.comment_content
    } : null
  }));

  res.status(200).json({ notifications: formattedNotifications });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { notificationId } = req.params;

  // Vérifier que la notification existe et appartient à l'utilisateur
  const notification = await sql`
    SELECT id FROM notifications 
    WHERE id = ${notificationId} AND to_user_id = ${user_id}
  `;

  if (notification.length === 0) {
    return res.status(404).json({ error: "Notification not found" });
  }

  // Supprimer la notification
  await sql`
    DELETE FROM notifications 
    WHERE id = ${notificationId} AND to_user_id = ${user_id}
  `;

  res.status(200).json({ message: "Notification deleted successfully" });
});