import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Handle both pooling and non-pooling URLs
const postgresUrl = (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '').replace('?sslmode=require', '');

async function showTables() {
  const client = new Client({ 
    connectionString: postgresUrl,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: true }
      : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const tables = [
      'profiles',
      'workspaces',
      'workspace_members',
      'channels',
      'messages',
      'direct_messages',
      'dm_participants',
      'reactions',
      'vectorized_messages',
      'vectorized_workspace_summaries'
    ];

    for (const table of tables) {
      console.log(`\n=== Contents of ${table} table ===`);
      const { rows: data } = await client.query(`SELECT * FROM ${table} LIMIT 5`);
      console.log(JSON.stringify(data, null, 2));

      const { rows: [{ count }] } = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`Total rows: ${count}`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

showTables().catch(console.error); 