import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Check environment variables
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};

console.log("[AI-Respond API] Checking environment variables:", {
  hasSupabaseUrl: !!requiredEnvVars.SUPABASE_URL,
  hasSupabaseKey: !!requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
  hasOpenAIKey: !!requiredEnvVars.OPENAI_API_KEY
});

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([name, value]) => {
  if (!value) {
    console.error(`[AI-Respond API] Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

let supabaseClient: SupabaseClient;
try {
  // Create Supabase client
  supabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  console.log("[AI-Respond API] Supabase client initialized successfully");
} catch (error) {
  console.error("[AI-Respond API] Error initializing Supabase client:", error);
  throw error;
}

export async function POST(request: NextRequest) {
  console.log("[AI-Respond API] Starting request processing");
  try {
    // Validate request body
    if (!request.body) {
      console.error("[AI-Respond API] No request body provided");
      return NextResponse.json(
        { error: "No request body provided" },
        { status: 400 }
      );
    }

    const { userId, question } = await request.json();
    console.log("[AI-Respond API] Received request:", { userId, question });

    if (!userId || !question) {
      console.log("[AI-Respond API] Missing required parameters:", { userId, question });
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create embeddings for the query
    console.log("[AI-Respond API] Creating embeddings with OpenAI");
    let embeddings;
    try {
      embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    } catch (error) {
      console.error("[AI-Respond API] Error creating embeddings:", error);
      throw error;
    }

    console.log("[AI-Respond API] Creating vector store");
    // Retrieve relevant documents from Supabase
    let vectorStore;
    try {
      vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabaseClient,
        tableName: "vectorized_messages",
        queryName: "match_documents",
      });
    } catch (error) {
      console.error("[AI-Respond API] Error creating vector store:", error);
      throw error;
    }

    const metadata = { user_id: userId };
    console.log("[AI-Respond API] Setting up retriever with metadata:", metadata);
    const retriever = vectorStore.asRetriever({
      filter: metadata,
      k: 10,
      searchType: "similarity",
    });

    console.log("[AI-Respond API] Getting relevant documents");
    let relevantDocs;
    try {
      relevantDocs = await retriever.getRelevantDocuments(question);
      console.log("[AI-Respond API] Found relevant documents:", { 
        count: relevantDocs.length,
        docs: relevantDocs.map(doc => ({
          pageContent: doc.pageContent.substring(0, 100) + "...",
          metadata: doc.metadata
        }))
      });
    } catch (error) {
      console.error("[AI-Respond API] Error getting relevant documents:", error);
      throw error;
    }

    if (relevantDocs.length === 0) {
      console.log("[AI-Respond API] No relevant context found");
      return NextResponse.json(
        { error: "No relevant context found for this user" },
        { status: 404 }
      );
    }

    // Prepare context for the LLM
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n");
    console.log("[AI-Respond API] Prepared context:", { contextLength: context.length });

    // Generate response using LLM
    console.log("[AI-Respond API] Initializing OpenAI");
    let llm;
    try {
      llm = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
      });
    } catch (error) {
      console.error("[AI-Respond API] Error initializing OpenAI:", error);
      throw error;
    }

    console.log("[AI-Respond API] Generating response with LLM");
    let response;
    try {
      response = await llm.call(
        `You are the user. Answer the following question in your own style based on your past messages:\n\nQuestion: ${question}\n\nContext from your past messages: ${context}\n\nAnswer:`
      );
      console.log("[AI-Respond API] Generated response:", { responseLength: response.length });
    } catch (error) {
      console.error("[AI-Respond API] Error generating response:", error);
      throw error;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AI-Respond API] Error in AI response generation:", error);
    if (error instanceof Error) {
      console.error("[AI-Respond API] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate AI response" },
      { status: 500 }
    );
  }
} 