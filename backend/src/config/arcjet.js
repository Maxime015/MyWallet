import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";
import { ENV } from "./env.js";

// Initialisation de la sécurité Arcjet avec des règles de protection
export const aj = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: ["ip.src"], // Utilise l'adresse IP source pour l'identification
  rules: [
    // 🛡️ "shield" protège l’application contre les attaques courantes 
    // telles que les injections SQL, XSS ou CSRF
    shield({ mode: "LIVE" }),

    // 🤖 Détection des bots — bloque tous les robots sauf les moteurs de recherche autorisés
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Autoriser uniquement les bots des moteurs de recherche légitimes
        // Liste complète disponible sur : https://arcjet.com/bot-list
      ],
    }),

    // ⚡ Limitation du nombre de requêtes via l’algorithme "Token Bucket"
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // Nombre de jetons ajoutés à chaque intervalle
      interval: 10,   // Intervalle en secondes (ici toutes les 10 secondes)
      capacity: 15,   // Nombre maximal de jetons dans le seau
    }),
  ],
});
