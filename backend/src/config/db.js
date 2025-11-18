import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import bcrypt from "bcryptjs";

// Connexion à la base de données
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // Extension pour UUID (nécessaire pour PostgreSQL)
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Table Users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table Transactions
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        CONSTRAINT transactions_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Subscriptions
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        label VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL, 
        date DATE NOT NULL,
        recurrence VARCHAR(50) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT subscriptions_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      )`;

    console.log("✅ Base de données initialisée avec succès !");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base :", error);
    process.exit(1);
  }
}

// Fonction pour hacher un mot de passe
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Fonction pour comparer les mots de passe
export async function comparePassword(userPassword, hashedPassword) {
  return await bcrypt.compare(userPassword, hashedPassword);
}