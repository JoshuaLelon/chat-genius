import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runUsageApp(question) {
  if (!question) {
    console.error("Question is required.");
    process.exit(1);
  }

  try {
    // Step 1: Create embeddings for the query
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

    // Step 2: Retrieve relevant documents from Supabase
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: "documents", // Ensure this matches the maintenance app's table
    });
    const retriever = vectorStore.asRetriever();
    const relevantDocs = await retriever.getRelevantDocuments(question);

    // Step 3: Prepare context for the LLM
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

    // Step 4: Generate a response using LLM
    const llm = new OpenAI({
      openAIApiKey: OPENAI_API_KEY,
      temperature: 0.7,
    });

    const response = await llm.call(
      `You are Person X. Answer the following question in your own style:\n\nQuestion: ${question}\n\nContext: ${context}\n\nAnswer:`
    );

    console.log("Question:", question);
    console.log("Answer:", response);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Replace this with the question you want to test
const testQuestion = "What are Person X's thoughts on productivity?";
runUsageApp(testQuestion);
