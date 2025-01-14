import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { Document } from "@langchain/core/documents";
import { CharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
console.log('Database URL (masked):', SUPABASE_URL.replace(/:[^/]+@/, ':****@'));
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function chunkIfNecessary(messages: string[], userId: string, chunkSize = 1000, chunkOverlap = 100): Promise<Document[]> {
  console.log(`Checking ${messages.length} messages for chunking necessity (chunkSize: ${chunkSize}, overlap: ${chunkOverlap})`);
  console.log('Message lengths:', messages.map(msg => msg.length));
  
  const needsSplitting = messages.some(msg => msg.length > chunkSize);
  console.log('Needs splitting:', needsSplitting);
  
  if (!needsSplitting) {
    const docs = messages.map(msg => ({ 
      pageContent: msg, 
      metadata: { user_id: userId }
    }));
    console.log(`Using ${docs.length} messages without splitting`);
    return docs;
  }

  console.log('Creating text splitter...');
  const splitter = new CharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  
  console.log('Splitting documents...');
  const docs = await splitter.createDocuments(
    messages,
    messages.map(() => ({ user_id: userId }))
  );
  console.log(`Split ${messages.length} messages into ${docs.length} chunks`);
  console.log('First chunk sample:', docs[0]?.pageContent?.substring(0, 100));
  return docs;
}

async function ensureVectorizedMessagesTable(): Promise<void> {
  console.log('Checking if vectorized_messages table exists...');
  const { data, error } = await supabaseClient
    .from('vectorized_messages')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error checking vectorized_messages table:', error);
    throw error;
  }

  console.log('Table vectorized_messages exists');
}

async function updateVectorStore(messages: string[], userId: string): Promise<void> {
  console.log(`Starting vector store update for user ${userId} with ${messages.length} messages`);
  
  console.log('Step 0: Ensuring table exists...');
  await ensureVectorizedMessagesTable();

  console.log('Step 1: Processing messages for chunking...');
  const docs = await chunkIfNecessary(messages, userId);
  console.log(`Processed ${docs.length} documents`);

  console.log('Step 2: Creating OpenAI embeddings instance...');
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

  console.log('Step 3: Uploading to Supabase vector store...');
  try {
    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client: supabaseClient,
      tableName: "vectorized_messages",
      queryName: "match_documents"
    });
    console.log("Vector store updated successfully");
  } catch (error) {
    console.error('Error updating vector store:', error);
    throw error;
  }
}

async function fetchUserMessages(userId: string): Promise<string[] | null> {
  console.log(`Fetching messages for user ${userId}...`);
  
  // Debug: Check profiles table
  console.log('\nChecking profiles table...');
  const { data: profiles, error: profilesError } = await supabaseClient
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.error('Error querying profiles:', profilesError);
  } else {
    console.log('All profiles:', profiles);
  }

  // Debug: Check messages table
  console.log('\nChecking messages table...');
  const { data: allMessages, error: messagesError } = await supabaseClient
    .from('messages')
    .select('*')
    .limit(5);
  
  if (messagesError) {
    console.error('Error querying messages:', messagesError);
  } else {
    console.log('Sample messages:', allMessages);
  }

  // Now proceed with the actual user messages query
  console.log('\nFetching specific user messages...');
  const { data: messages, error } = await supabaseClient
    .from('messages')
    .select('content, id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching messages:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return null;
  }

  if (!messages || messages.length === 0) {
    console.log(`No messages found for user ${userId}`);
    return null;
  }

  console.log(`Found ${messages.length} messages for user ${userId}`);
  console.log('Message IDs:', messages.map(m => m.id).join(', '));
  console.log('First few messages:', messages.slice(0, 3).map(m => m.content));
  return messages.map(msg => msg.content);
}

async function main() {
  console.log('Starting vectorization process...');
  const ALICE_ID = '00000000-0000-0000-0000-000000000001';
  console.log(`Processing messages for user ${ALICE_ID}`);
  
  const messages = await fetchUserMessages(ALICE_ID);
  
  if (!messages) {
    console.log('No messages to process, exiting');
    return;
  }
  
  await updateVectorStore(messages, ALICE_ID);
  console.log('Process completed successfully');
}

console.log('Script started');
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 