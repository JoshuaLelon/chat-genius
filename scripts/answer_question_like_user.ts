import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// Load environment variables and validate them
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

interface RunUsageAppParams {
  question: string;
  userId: string;
}

async function runUsageApp({ question, userId }: RunUsageAppParams): Promise<string | undefined> {
  console.log(`Starting answer generation for user ${userId}`);
  console.log(`Question: ${question}`);

  if (!question) {
    throw new Error("Question is required.");
  }

  try {
    // Step 1: Create embeddings for the query
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });
    const embedding = await embeddings.embedQuery(question);

    // Step 2: Retrieve relevant documents from Supabase
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: "vectorized_messages",
      queryName: "match_documents"
    });

    const metadata = { user_id: userId };
    const retriever = vectorStore.asRetriever({
      filter: metadata,
      k: 10,
      searchType: "similarity"
    });

    const relevantDocs = await retriever.getRelevantDocuments(question);
    if (relevantDocs.length > 0) {
      console.log(`Using ${relevantDocs.length} messages from your history as context`);
      
      // Step 3: Prepare context for the LLM
      const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

      // Step 4: Generate a response using LLM
      const llm = new OpenAI({
        openAIApiKey: OPENAI_API_KEY,
        temperature: 0.7,
      });

      const response = await llm.call(
        `You are the user. Answer the following question in your own style based on your past messages:\n\nQuestion: ${question}\n\nContext from your past messages: ${context}\n\nAnswer:`
      );

      console.log("\nResponse:", response);
      return response;
    } else {
      console.warn("Warning: No relevant messages found in your history to answer this question");
      return;
    }

  } catch (error) {
    console.error("An error occurred:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const [userId, ...questionParts] = args;
const question = questionParts.join(" ");

if (!userId || !question) {
  console.error("Usage: ts-node answer_question_like_user.ts <userId> <question>");
  process.exit(1);
}

runUsageApp({ userId, question })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 