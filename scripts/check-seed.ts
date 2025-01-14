import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkSeedData() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL!.replace('?sslmode=require&supa=base-pooler.x', ''),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const tables = [
      { schema: 'auth', name: 'users' },
      { schema: 'public', name: 'profiles' },
      { schema: 'public', name: 'workspaces' },
      { schema: 'public', name: 'workspace_members' },
      { schema: 'public', name: 'channels' },
      { schema: 'public', name: 'messages' },
      { schema: 'public', name: 'dm_participants' },
      { schema: 'public', name: 'reactions' }
    ];

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table.schema}.${table.name}`);
      console.log(`${table.schema}.${table.name}: ${result.rows[0].count} rows`);

      // Get sample data
      const sample = await client.query(`SELECT * FROM ${table.schema}.${table.name} LIMIT 1`);
      if (sample.rows.length > 0) {
        console.log(`Sample data:`, sample.rows[0]);
      }
      console.log('---');
    }

  } catch (error) {
    console.error("Error checking seed data:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if this is the main module
if (require.main === module) {
  checkSeedData().catch(console.error);
} 