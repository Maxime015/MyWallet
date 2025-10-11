import { aj } from "../config/arcjet.js";

// 🛡️ Middleware Arcjet pour la sécurité, la détection de bots et la limitation de requêtes
export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Chaque requête consomme 1 jeton (pour la limitation de fréquence)
    const decision = await aj.protect(req, {
      requested: 1,
    });

    // 🚫 Gérer les requêtes refusées par Arcjet
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        // Trop de requêtes envoyées en peu de temps
        return res.status(429).json({
          error: "Trop de requêtes",
          message: "La limite de requêtes a été dépassée. Veuillez réessayer plus tard.",
        });
      } else if (decision.reason.isBot()) {
        // Accès bloqué pour les robots non autorisés
        return res.status(403).json({
          error: "Accès refusé au bot",
          message: "Les requêtes automatisées ne sont pas autorisées.",
        });
      } else {
        // Autres blocages (politique de sécurité)
        return res.status(403).json({
          error: "Accès interdit",
          message: "Accès refusé par la politique de sécurité.",
        });
      }
    }

    // 🤖 Détection des bots usurpés (faux bots imitant des moteurs de recherche)
    if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      return res.status(403).json({
        error: "Bot usurpé détecté",
        message: "Activité suspecte détectée (bot malveillant).",
      });
    }

    // ✅ Continuer la requête si tout est valide
    next();
  } catch (error) {
    console.error("Erreur du middleware Arcjet :", error);
    // En cas d’erreur interne d’Arcjet, laisser la requête continuer
    next();
  }
};
