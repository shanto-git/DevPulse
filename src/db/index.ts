import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.database_url,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            password VARCHAR NOT NULL,
            role VARCHAR NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')) CHECK (role <> ''),
            
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW())
            `);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK (length(description) >= 20),
            type VARCHAR(20) NOT NULL CHECK (
            type IN ('bug', 'feature_request')),
            status VARCHAR(20) NOT NULL DEFAULT 'open'
            CHECK (status IN ('open','in_progress', 'resolved')),
            reporter_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW())
            `);
  } catch (error) {
    console.log(error);
  }
};
