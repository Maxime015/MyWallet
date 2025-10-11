import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import rateLimiter from "./middleware/rateLimiter.js";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ENV } from "./config/env.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";

// Configuration Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = YAML.load(join(__dirname, './docs/swagger.yaml'));

import authRoutes from './routes/authRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import subscriptionsRoute from './routes/subscriptionsRoute.js';

import protectRoute from './middleware/auth.middleware.js';

import job from "./config/cron.js";

const app = express();

if (ENV.NODE_ENV === "production") job.start();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// Initialiser la base de données
await initDB();

// Route de documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "e-Track API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  }
}));

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Serveur fonctionne',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV || 'development'
  });
});

app.use(arcjetMiddleware);

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/budgets', protectRoute, budgetRoutes);
app.use('/api/transactions', protectRoute, transactionRoutes);
app.use('/api/subscriptions', subscriptionsRoute);

// Route 404 pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Route ${req.originalUrl} non trouvée` 
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({ 
    status: 'error', 
    message: 'Erreur interne du serveur',
    ...(ENV.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

const PORT = ENV.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${ENV.NODE_ENV || 'development'}`);
  console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;