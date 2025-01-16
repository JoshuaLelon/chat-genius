import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createSeedUsersWithAuth } from "./seed-auth-users";
import { updateVectorStore, supabaseClient as vectorStoreClient, clearVectorStore } from "./create_or_update_vector_db";
import { main as updateWorkspaceSummaries } from "./create_or_update_workspace_summaries";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Create Supabase client with service role
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Handle both pooling and non-pooling URLs
const postgresUrl = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '');

interface Message {
  id: string;
  content: string;
  user_id: string;
}

async function resetDatabase() {
  console.log("Starting database reset...");
  const client = new Client({ 
    connectionString: postgresUrl,
    ssl: process.env.NODE_ENV === 'production' 
      ? {
          rejectUnauthorized: true
        }
      : {
          rejectUnauthorized: false
        }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Start transaction
    await client.query('BEGIN');

    try {
      // Drop existing schema
      console.log("Clearing existing data...");
      await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
      await client.query('CREATE SCHEMA public;');
      console.log("Existing data cleared");

      // Run the initial schema migration
      console.log("Running initial schema migration...");
      const migrationPath = path.resolve(__dirname, "../supabase/migrations/initial_schema_and_policies.sql");
      const migration = fs.readFileSync(migrationPath, "utf8");
      await client.query(migration);
      console.log("Database migration completed");

      // Commit schema changes
      await client.query('COMMIT');
      
      // Create auth users with passwords first
      console.log("Creating auth users...");
      try {
        await createSeedUsersWithAuth();
        console.log("Auth users created");
      } catch (error) {
        console.error("Error creating auth users:", error);
        throw error;
      }

      // Start new transaction for seed data
      await client.query('BEGIN');

      // Run the seed SQL file
      console.log("Running seed SQL file...");
      const seedPath = path.resolve(__dirname, "../supabase/seed.sql");
      const seed = fs.readFileSync(seedPath, "utf8");
      await client.query(seed);
      console.log("Database SQL seeding completed");

      // Run the messages seed file
      console.log("Running messages seed file...");
      const messagesSeedPath = path.resolve(__dirname, "../supabase/seed-messages.sql");
      const messagesSeed = fs.readFileSync(messagesSeedPath, "utf8");
      await client.query(messagesSeed);
      console.log("Messages seeding completed");

      // Commit seed data
      await client.query('COMMIT');

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }

    // Close pg client before using supabase client
    await client.end();

    // Update vector store with seeded messages
    console.log("Updating vector store...");
    
    try {
      // Clear any existing vectors first
      await clearVectorStore();
      console.log("Existing vectors cleared");

      const { data: messages, error } = await supabaseClient
        .from('messages')
        .select('id, content, user_id');

      if (error) {
        throw error;
      }

      if (!messages || messages.length === 0) {
        console.log("No messages found to vectorize");
        return;
      }

      // Group messages by user_id
      const messagesByUser = new Map<string, { id: string; content: string }[]>();
      messages.forEach((msg: Message) => {
        const userMessages = messagesByUser.get(msg.user_id) || [];
        userMessages.push({ id: msg.id, content: msg.content });
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
      console.log("Vector store update completed");

      // Update workspace summaries
      console.log("Updating workspace summaries...");
      try {
        await updateWorkspaceSummaries();
        console.log("Workspace summaries updated successfully");
      } catch (error) {
        console.error("Error updating workspace summaries:", error);
        throw error;
      }

    } catch (error) {
      console.error("Error updating vector store:", error);
      throw error;
    }

    console.log("Database reset and seeding completed successfully!");

    // Verify vector stores
    console.log("\nVerifying vector stores...");
    const { count: messageCount, error: messageError } = await vectorStoreClient
      .from("vectorized_messages")
      .select("*", { count: "exact" });

    if (messageError) {
      console.error("Error checking vectorized messages:", messageError);
    } else {
      console.log(`Vectorized messages count: ${messageCount ?? 0}`);
    }

    // Check vectorized workspace summaries
    const { count: summaryCount, error: summaryError } = await vectorStoreClient
      .from("vectorized_workspace_summaries")
      .select("*", { count: "exact" });

    if (summaryError) {
      console.error("Error checking workspace summaries:", summaryError);
    } else {
      console.log(`Vectorized workspace summaries count: ${summaryCount ?? 0}`);
    }

    // Get a sample of each to verify embeddings exist
    const { data: messageSample } = await vectorStoreClient
      .from("vectorized_messages")
      .select("*")
      .limit(1);

    const { data: summarySample } = await vectorStoreClient
      .from("vectorized_workspace_summaries")
      .select("*")
      .limit(1);

    console.log("\nSample checks:");
    console.log("Message embedding exists:", messageSample?.[0]?.embedding ? "Yes" : "No");
    console.log("Summary embedding exists:", summarySample?.[0]?.embedding ? "Yes" : "No");

  } catch (error) {
    console.error("Error in database reset:", error);
    throw error;
  } finally {
    // Ensure client is closed even if an error occurs
    try {
      await client.end();
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }
}

// Only run if this is the main module
if (require.main === module) {
  resetDatabase().catch(console.error);
} 