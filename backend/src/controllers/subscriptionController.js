import { sql } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// Helper function pour la validation
const validateSubscriptionData = (data) => {
  const errors = [];
  
  if (!data.label?.trim()) errors.push('Label is required');
  
  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) errors.push('Amount must be a positive number');
  
  if (!data.date || !Date.parse(data.date)) {
    errors.push('Invalid date format (YYYY-MM-DD required)');
  }
  
  const validRecurrences = ["monthly", "yearly", "weekly"];
  if (!validRecurrences.includes(data.recurrence)) {
    errors.push(`Recurrence must be one of: ${validRecurrences.join(', ')}`);
  }
  
  const rating = parseInt(data.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be an integer between 1 and 5');
  }
  
  return errors.length > 0 ? errors : null;
};

// ✅ AMÉLIORATION : Meilleure gestion d'erreur Cloudinary
const uploadImageToCloudinary = async (imageDataUrl) => {
  try {
    if (!imageDataUrl) return null;
    
    const result = await cloudinary.uploader.upload(imageDataUrl, {
      folder: 'subscriptions',
      resource_type: 'image',
      overwrite: true
    });

    console.log("✅ Image uploaded successfully to Cloudinary");
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    
    // Gestion spécifique des erreurs Cloudinary
    if (error.http_code === 400) {
      throw new Error('Invalid image format or corrupted image data');
    } else if (error.http_code === 413) {
      throw new Error('Image file too large');
    } else {
      throw new Error('Image upload service temporarily unavailable');
    }
  }
};

// Supprime une image de Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extraire le public_id de l'URL Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0];
    const fullPublicId = `subscriptions/${publicId}`;
    
    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Récupère les abonnements de l'utilisateur authentifié
export async function getSubscriptions(req, res) {
  try {
    const user_id = req.user.id;

    const subscriptions = await sql`
      SELECT 
        id,
        user_id,
        label,
        amount::float,
        to_char(date, 'YYYY-MM-DD') as date,
        recurrence,
        rating,
        image_url,
        created_at
      FROM subscriptions 
      WHERE user_id = ${user_id} 
      ORDER BY created_at DESC`;

    res.status(200).json(subscriptions);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Crée un nouvel abonnement pour l'utilisateur authentifié
export async function createSubscription(req, res) {
  try {
    const errors = validateSubscriptionData(req.body);
    if (errors) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }

    const { label, amount, date, recurrence, image, rating } = req.body;
    const user_id = req.user.id; // Récupéré du middleware d'authentification
    const amountNum = parseFloat(amount).toFixed(2);
    const ratingInt = parseInt(rating);

    // Upload de l'image sur Cloudinary si elle existe
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImageToCloudinary(image);
    }

    const [subscription] = await sql`
      INSERT INTO subscriptions 
        (user_id, label, amount, date, recurrence, rating, image_url) 
      VALUES 
        (${user_id}, ${label.trim()}, ${amountNum}, ${date}::date, ${recurrence}, ${ratingInt}, ${imageUrl || null})
      RETURNING 
        id,
        user_id,
        label,
        amount::float,
        to_char(date, 'YYYY-MM-DD') as date,
        recurrence,
        rating,
        image_url,
        created_at`; 

    res.status(201).json(subscription);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to create subscription',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Supprime un abonnement (vérifie qu'il appartient à l'utilisateur)
export async function deleteSubscription(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ message: 'Invalid subscription ID' });
    }

    // Récupérer l'abonnement pour vérifier l'appartenance et avoir l'URL de l'image
    const [subscription] = await sql`
      SELECT image_url FROM subscriptions WHERE id = ${id} AND user_id = ${user_id}`;

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or access denied' });
    }

    // Supprimer l'image de Cloudinary si elle existe
    if (subscription.image_url) {
      await deleteImageFromCloudinary(subscription.image_url);
    }

    // Supprimer l'abonnement de la base de données
    const [deleted] = await sql`
      DELETE FROM subscriptions 
      WHERE id = ${id} AND user_id = ${user_id}
      RETURNING *`;

    if (!deleted) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({ 
      message: 'Deleted subscription successfully',
      deletedId: deleted.id
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Total Montant Abonnement et Nombre Abonnement pour l'utilisateur authentifié
export async function getSummary(req, res) {
  try {
    const user_id = req.user.id;

    const [result] = await sql`
      SELECT 
        COALESCE(SUM(amount), 0)::float as total,
        COUNT(*)::int as count
      FROM subscriptions 
      WHERE user_id = ${user_id}`;

    res.status(200).json({
      total: result.total || 0,
      count: result.count || 0
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};
