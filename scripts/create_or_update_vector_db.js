import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function chunkIfNecessary(messages, chunkSize = 1000, chunkOverlap = 100) {
  const needsSplitting = messages.some(msg => msg.length > chunkSize);
  
  if (!needsSplitting) {
    const docs = messages.map(msg => ({ pageContent: msg }));
    console.log(`Using ${docs.length} messages without splitting`);
    return docs;
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  
  const docs = await splitter.splitDocuments(
    messages.map((msg) => ({ pageContent: msg }))
  );
  console.log(`Split ${messages.length} messages into ${docs.length} chunks`);
  return docs;
}

async function ensureVectorizedMessagesTable() {
  // Check if table exists
  const { data, error } = await supabaseClient
    .from('vectorized_messages')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') { // Table doesn't exist error code
    // Create the table using Supabase's SQL query
    const { error: createError } = await supabaseClient.rpc('exec', {
      query: `
        create table public.vectorized_messages (
          id bigserial primary key,
          content text,
          embedding vector(1536),
          user_id uuid references public.profiles(id) not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );

        create index on public.vectorized_messages using btree (user_id);
      `
    });

    if (createError) {
      console.error('Error creating vectorized_messages table:', createError);
      throw createError;
    }

    console.log('Created vectorized_messages table');
  } else if (error) {
    console.error('Error checking vectorized_messages table:', error);
    throw error;
  }
}

async function updateVectorStore(messages, userId) {
  // Step 0: Ensure table exists
  await ensureVectorizedMessagesTable();

  // Step 1: Split messages into chunks if needed
  const docs = await chunkIfNecessary(messages);

  // Step 2: Create embeddings
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

  // Step 3: Upload to Supabase
  const vectorStore = await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client: supabaseClient,
    tableName: "vectorized_messages",
    extraData: {
      user_id: userId
    }
  });

  console.log("Vector store updated successfully.");
}

async function fetchUserMessages(userId) {
  const { data: messages, error } = await supabaseClient
    .from('messages')
    .select('content')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching messages:', error);
    return null;
  }

  if (!messages || messages.length === 0) {
    console.log(`No messages found for user ${userId}`);
    return null;
  }

  return messages.map(msg => msg.content);
}

async function main() {
  const ALICE_ID = '372407a3-5657-4442-910e-b81b3ad83b86';
  const messages = await fetchUserMessages(ALICE_ID);
  
  if (!messages) return;
  
  await updateVectorStore(messages, ALICE_ID);
}

main().catch(console.error);
