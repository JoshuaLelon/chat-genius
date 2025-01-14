import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import * as dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

async function main() {
  console.log("Creating Supabase client...");
  const supabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  console.log("Fetching messages from database...");
  const { data: messages, error } = await supabaseClient
    .from("messages")
    .select("id, content, user_id, created_at");

  if (error) {
    throw error;
  }

  console.log(`Found ${messages.length} messages to process`);

  // Create embeddings instance
  console.log("Creating OpenAI embeddings instance...");
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Create vector store
  console.log("Creating vector store...");
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: "vectorized_messages",
    queryName: "match_documents",
  });

  // Process messages in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(messages.length / batchSize)}`);

    const documents = batch.map(msg => ({
      pageContent: msg.content,
      metadata: {
        user_id: msg.user_id,
        message_id: msg.id,
        created_at: msg.created_at
      }
    }));

    await vectorStore.addDocuments(documents);
    
    // Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("Done! Vector store has been populated with message embeddings.");
}

main().catch(console.error); 