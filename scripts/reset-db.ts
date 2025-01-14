import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createSeedUsersWithAuth } from "./seed-auth-users";
import { updateVectorStore, supabaseClient, clearVectorStore } from "./create_or_update_vector_db";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const postgresUrl = process.env.POSTGRES_URL_NON_POOLING!.replace('?sslmode=require', '?sslmode=prefer');

interface Message {
  content: string;
  user_id: string;
}

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
        TRUNCATE TABLE public.vectorized_messages CASCADE;
        
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
    console.log("Running seed SQL file...");
    const seedPath = path.resolve(__dirname, "../supabase/seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");
    await client.query(seed);
    console.log("Database SQL seeding completed");

    // Close the pg client before using supabase client
    await client.end();

    // Update vector store with seeded messages
    console.log("Updating vector store...");
    
    // Clear any existing vectors first
    await clearVectorStore();
    console.log("Existing vectors cleared");

    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select('content, user_id');

    if (error) {
      throw error;
    }

    if (messages && messages.length > 0) {
      // Group messages by user_id
      const messagesByUser = new Map<string, string[]>();
      messages.forEach((msg: Message) => {
        const userMessages = messagesByUser.get(msg.user_id) || [];
        userMessages.push(msg.content);
        messagesByUser.set(msg.user_id, userMessages);
      });

      // Process each user's messages
      for (const [userId, userMessages] of messagesByUser.entries()) {
        console.log(`Processing vectors for user ${userId}: ${userMessages.length} messages`);
        try {
          await updateVectorStore(userMessages, userId);
          console.log(`Successfully processed vectors for user ${userId}`);
        } catch (error) {
          console.error(`Error processing vectors for user ${userId}:`, error);
          throw error;
        }
      }
    } else {
      console.log("No messages found to vectorize");
    }
    console.log("Vector store update completed");

    console.log("Database reset and seeding completed successfully!");
  } catch (error) {
    console.error("Error in database reset:", error);
    throw error;
  }
}

// Only run if this is the main module
if (require.main === module) {
  resetDatabase().catch(console.error);
} 