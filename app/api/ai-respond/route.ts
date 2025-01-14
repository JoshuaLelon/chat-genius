import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
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

export async function POST(request: NextRequest) {
  try {
    const { userId, question } = await request.json();

    if (!userId || !question) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create embeddings for the query
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Retrieve relevant documents from Supabase
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: "vectorized_messages",
      queryName: "match_documents",
    });

    const metadata = { user_id: userId };
    const retriever = vectorStore.asRetriever({
      filter: metadata,
      k: 10,
      searchType: "similarity",
    });

    const relevantDocs = await retriever.getRelevantDocuments(question);

    if (relevantDocs.length === 0) {
      return NextResponse.json(
        { error: "No relevant context found for this user" },
        { status: 404 }
      );
    }

    // Prepare context for the LLM
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

    // Generate response using LLM
    const llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
    });

    const response = await llm.call(
      `You are the user. Answer the following question in your own style based on your past messages:\n\nQuestion: ${question}\n\nContext from your past messages: ${context}\n\nAnswer:`
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in AI response generation:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
} 