import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { Document } from "@langchain/core/documents";
import { CharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function chunkIfNecessary(messages: string[], userId: string, chunkSize = 1000, chunkOverlap = 100): Promise<Document[]> {
  const needsSplitting = messages.some(msg => msg.length > chunkSize);
  
  if (!needsSplitting) {
    return messages.map(msg => ({ 
      pageContent: msg, 
      metadata: { user_id: userId }
    }));
  }

  const splitter = new CharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  
  return await splitter.createDocuments(
    messages,
    messages.map(() => ({ user_id: userId }))
  );
}

async function ensureVectorizedMessagesTable(): Promise<void> {
  // Check if table exists
  const { error } = await supabaseClient
    .from('vectorized_messages')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') { // Table doesn't exist
    throw new Error('vectorized_messages table does not exist. Please run migrations first.');
  } else if (error) {
    throw error;
  }
}

export async function updateVectorStore(messages: string[], userId: string): Promise<void> {
  await ensureVectorizedMessagesTable();
  const docs = await chunkIfNecessary(messages, userId);
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

  await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client: supabaseClient,
    tableName: "vectorized_messages",
    queryName: "match_documents"
  });
}

export async function clearVectorStore(): Promise<void> {
  await ensureVectorizedMessagesTable();
  await supabaseClient
    .from('vectorized_messages')
    .delete()
    .neq('id', 0);
} 