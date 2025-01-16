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

    // Debug: Check if profiles table exists and has data
    const { data: allProfiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .limit(5);
    
    console.log("[AI-Respond API] First 5 profiles in database:", { 
      profiles: allProfiles,
      error: profilesError
    });

    // Get the user's profile ID from the profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    console.log("[AI-Respond API] Profile lookup result:", {
      profile,
      error: profileError,
      searchedId: userId
    });

    if (profileError || !profile) {
      console.error("[AI-Respond API] Error getting profile:", profileError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize vector store
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: 'vectorized_messages',
      queryName: 'match_documents',
    });

    // Get the user's recent messages for context
    const { data: recentMessages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (messagesError) {
      console.error("[AI-Respond API] Error getting recent messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to get message history" },
        { status: 500 }
      );
    }

    // Calculate recall score based on semantic similarity
    let recallScore = 0;
    let relevantMessages: typeof recentMessages = [];

    if (recentMessages && recentMessages.length > 0) {
      console.log("[AI-Respond API] Calculating similarities for messages:", {
        questionLength: question.length,
        numMessages: recentMessages.length
      });

      // Get embeddings for the current question and recent messages
      const questionEmbedding = await embeddings.embedQuery(question);
      const messageEmbeddings = await Promise.all(
        recentMessages.map(msg => embeddings.embedQuery(msg.content))
      );

      // Calculate cosine similarity between question and each message
      const similarities = messageEmbeddings.map((msgEmbed, idx) => {
        const dotProduct = questionEmbedding.reduce((sum, val, i) => sum + val * msgEmbed[i], 0);
        const questionMagnitude = Math.sqrt(questionEmbedding.reduce((sum, val) => sum + val * val, 0));
        const messageMagnitude = Math.sqrt(msgEmbed.reduce((sum, val) => sum + val * val, 0));
        const similarity = dotProduct / (questionMagnitude * messageMagnitude);
        
        console.log("[AI-Respond API] Message similarity:", {
          messageIndex: idx,
          messagePreview: recentMessages[idx].content.slice(0, 50) + "...",
          similarity,
          isRelevant: similarity > 0.80
        });
        
        return {
          similarity,
          message: recentMessages[idx]
        };
      });

      // Consider messages with similarity > 0.80 as relevant
      relevantMessages = similarities
        .filter(({similarity}) => similarity > 0.80)
        .map(({message}) => message);
      
      recallScore = relevantMessages.length / similarities.length;
      
      console.log("[AI-Respond API] Final recall calculation:", {
        totalMessages: similarities.length,
        relevantMessages: relevantMessages.length,
        recallScore,
        similarities: similarities.map(s => s.similarity)
      });
    }

    // Create context only from relevant messages
    const context = relevantMessages.length > 0
      ? relevantMessages.map(m => m.content).join('\n')
      : '';

    // Initialize OpenAI
    const llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // Generate AI response
    const response = await llm.invoke(
      `Context from previous messages:
      ${context}
      
      User: ${question}
      Assistant: `
    );

    console.log("[AI-Respond API] Generated response:", {
      responseLength: response.length,
      recallScore
    });

    return NextResponse.json({
      answer: response,
      recallScore
    });
  } catch (error) {
    console.error("[AI-Respond API] Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Test response" });
} 