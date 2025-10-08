// db.js
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import bcrypt from "bcryptjs";

// Connexion à la base de données
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // Table Users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(255) DEFAULT '',
        last_name VARCHAR(255) DEFAULT '',
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255) DEFAULT '',
        bio VARCHAR(160) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table Budgets
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT budgets_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Transactions
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL, 
        budget_id INTEGER,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT transactions_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT transactions_budget_id_fkey 
          FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Subscriptions
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        label VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL, 
        date DATE NOT NULL,
        recurrence VARCHAR(50) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        image_url VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT subscriptions_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Groceries
    await sql`
      CREATE TABLE IF NOT EXISTS groceries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT groceries_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Posts
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255),
        content VARCHAR(280),
        image TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT posts_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Comments
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        content VARCHAR(280) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT comments_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT comments_post_id_fkey 
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        post_id INTEGER,
        comment_id INTEGER,
        type VARCHAR(20) CHECK (type IN ('follow', 'like', 'comment')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT notifications_from_user_id_fkey 
          FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT notifications_to_user_id_fkey 
          FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT notifications_post_id_fkey 
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT notifications_comment_id_fkey 
          FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    // Table Followers (relations Many-to-Many)
    await sql`
      CREATE TABLE IF NOT EXISTS followers (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, follower_id)
      )
    `;

    // Table Post Likes
    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
      )
    `;

    // Table Comment Likes
    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, comment_id)
      )
    `;

    // Créer les indexes un par un
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id)`;

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