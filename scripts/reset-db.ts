import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createSeedUsersWithAuth } from "./seed-auth-users";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const postgresUrl = process.env.POSTGRES_URL_NON_POOLING!.replace('?sslmode=require', '?sslmode=prefer');

async function resetDatabase() {
  console.log("Starting database reset...");

  const client = new Client({
    connectionString: process.env.POSTGRES_URL!.replace('?sslmode=require&supa=base-pooler.x', ''),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Clear existing data
    console.log("Clearing existing data...");
    await client.query(`
      DO $$ 
      BEGIN
        -- Disable triggers temporarily
        SET session_replication_role = 'replica';
        
        -- Delete data from public schema tables
        TRUNCATE TABLE public.reactions CASCADE;
        TRUNCATE TABLE public.messages CASCADE;
        TRUNCATE TABLE public.dm_participants CASCADE;
        TRUNCATE TABLE public.direct_messages CASCADE;
        TRUNCATE TABLE public.channels CASCADE;
        TRUNCATE TABLE public.workspace_members CASCADE;
        TRUNCATE TABLE public.workspaces CASCADE;
        TRUNCATE TABLE public.profiles CASCADE;
        
        -- Delete data from auth schema tables
        TRUNCATE TABLE auth.users CASCADE;
        
        -- Re-enable triggers
        SET session_replication_role = 'origin';
      END $$;
    `);
    console.log("Existing data cleared");

    // Run the initial schema migration
    console.log("Running initial schema migration...");
    const migrationPath = path.resolve(__dirname, "../supabase/migrations/initial_schema_and_policies.sql");
    const migration = fs.readFileSync(migrationPath, "utf8");
    await client.query(migration);
    console.log("Database migration completed");

    // Create auth users with passwords first
    console.log("Creating auth users...");
    await createSeedUsersWithAuth();
    console.log("Auth users created");

    // Run the seed SQL file
    const seedPath = path.resolve(__dirname, "../supabase/seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");
    await client.query(seed);
    console.log("Database SQL seeding completed");

    console.log("Database reset and seeding completed successfully!");
  } catch (error) {
    console.error("Error in database reset:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Only run if this is the main module
if (require.main === module) {
  resetDatabase().catch(console.error);
} 