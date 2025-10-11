import { sql } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// Helper function pour la validation
const validateSubscriptionData = (data) => {
  const errors = [];
  
  if (!data.label?.trim()) errors.push('Le libellé est requis');
  
  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) errors.push('Le montant doit être un nombre positif');
  
  if (!Date.parse(data.date)) errors.push('Format de date invalide (YYYY-MM-DD requis)');
  
  const validRecurrences = ["monthly", "yearly", "weekly"];
  if (!validRecurrences.includes(data.recurrence)) {
    errors.push(`La récurrence doit être l'une des valeurs suivantes : ${validRecurrences.join(', ')}`);
  }
  
  const rating = parseInt(data.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('La note doit être un entier entre 1 et 5');
  }

  console.error('Erreurs de validation :', errors);
  
  return errors.length > 0 ? errors : null;
};

// Upload une image sur Cloudinary
const uploadImageToCloudinary = async (imageDataUrl) => {
  try {
    if (!imageDataUrl) return null;
    
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: 'subscriptions',
        resource_type: 'image',
        overwrite: true
      }
    );

    return result.secure_url;
  } catch (error) {
    console.error('Erreur Cloudinary lors du téléchargement :', error);
    throw new Error('Échec du téléchargement de l\'image');
  }
};

// Supprime une image de Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    const publicId = imageUrl.split('/').pop().split('.')[0];
    const fullPublicId = `subscriptions/${publicId}`;
    
    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error('Erreur Cloudinary lors de la suppression :', error);
    throw new Error('Échec de la suppression de l\'image');
  }
};

// Récupère les abonnements de l'utilisateur connecté
export async function getSubscriptionByUserId(req, res) {
  try {
    const userId = req.user.id; // Récupéré du middleware d'authentification

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
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC`;

    res.status(200).json(subscriptions);

  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Crée un nouvel abonnement pour l'utilisateur connecté
export async function createSubscription(req, res) {
  try {
    const errors = validateSubscriptionData(req.body);
    if (errors) {
      return res.status(400).json({ 
        message: 'Échec de la validation',
        errors 
      });
    }

    const { label, amount, date, recurrence, image, rating } = req.body;
    const userId = req.user.id; // Récupéré du middleware d'authentification
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
        (${userId}, ${label.trim()}, ${amountNum}, ${date}::date, ${recurrence}, ${ratingInt}, ${imageUrl || null})
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

    res.status(201).json({
      message: 'Abonnement créé avec succès',
      subscription
    });

  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({
      message: error.message || 'Échec de la création de l\'abonnement',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Supprime un abonnement (vérifie que l'utilisateur est propriétaire)
export async function deleteSubscription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Récupéré du middleware d'authentification

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ message: 'ID d\'abonnement invalide' });
    }

    // Récupérer l'abonnement avec vérification du propriétaire
    const [subscription] = await sql`
      SELECT image_url FROM subscriptions WHERE id = ${id} AND user_id = ${userId}`;

    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    // Supprimer l'image de Cloudinary si elle existe
    if (subscription.image_url) {
      await deleteImageFromCloudinary(subscription.image_url);
    }

    // Supprimer l'abonnement avec vérification du propriétaire
    const [deleted] = await sql`
      DELETE FROM subscriptions 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *`;

    if (!deleted) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    res.status(200).json({ 
      message: 'Abonnement supprimé avec succès',
      deletedId: deleted.id
    });

  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ 
      message: error.message || 'Erreur interne du serveur',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Total Montant Abonnement et Nombre Abonnement pour l'utilisateur connecté
export async function getSummaryByUserId(req, res) {
  try {
    const userId = req.user.id; // Récupéré du middleware d'authentification

    const [result] = await sql`
      SELECT 
        COALESCE(SUM(amount), 0)::float as total,
        COUNT(*)::int as count
      FROM subscriptions 
      WHERE user_id = ${userId}`;

    res.status(200).json({
      message: 'Récupération du résumé réussie',
      total: result.total || 0,
      count: result.count || 0
    });

  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};