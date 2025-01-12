import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const postgresUrl = process.env.POSTGRES_URL_NON_POOLING!;

async function resetDatabase() {
  console.log("Starting database reset...");

  const client = new Client({
    connectionString: postgresUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Read the schema file
    const schemaPath = path.resolve(__dirname, "../supabase/migrations/20240112_initial_schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute the schema SQL
    await client.query(schema);
    console.log("Database reset completed successfully!");
  } catch (error) {
    console.error("Error in database reset:", error);
  } finally {
    await client.end();
  }
}

resetDatabase().catch(console.error); 