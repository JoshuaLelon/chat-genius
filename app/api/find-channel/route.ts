import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from '@langchain/openai'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
})

interface Channel {
  id: string
  name: string
  workspace_id: string
}

interface Message {
  content: string
  channels: Channel
}

interface ChannelSummary {
  id: string
  name: string
  messages: string[]
}

interface Workspace {
  name: string
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    console.log('Received query:', query)

    // Embed the search query
    const [queryEmbedding] = await embeddings.embedDocuments([query])
    console.log('Query embedding length:', queryEmbedding.length)

    // First check if we have any workspace summaries
    const { data: summaries, error: summariesError } = await supabase
      .from('vectorized_workspace_summaries')
      .select('*')

    if (summariesError) {
      console.error('Error checking workspace summaries:', summariesError)
      throw summariesError
    }

    console.log('Found', summaries?.length || 0, 'workspace summaries')

    if (!summaries?.length) {
      return NextResponse.json({ error: 'No workspace summaries found' }, { status: 404 })
    }

    // Manual similarity search
    const workspacesWithScores = summaries
      .map(summary => {
        try {
          // Parse the embedding string into an array and clean invalid values
          let embeddingArray: number[] | null = null;
          
          if (typeof summary.embedding === 'string') {
            // Split and parse, replacing any invalid values with 0
            embeddingArray = summary.embedding
              .split(',')
              .map((str: string) => {
                const num = parseFloat(str.trim());
                return isNaN(num) ? 0 : num;
              });
          } else if (Array.isArray(summary.embedding)) {
            embeddingArray = summary.embedding.map((val: number) => isNaN(val) ? 0 : val);
          }

          if (!embeddingArray || embeddingArray.length !== queryEmbedding.length) {
            console.error('Invalid embedding format or length for workspace:', summary.workspace_id);
            return null;
          }

          // Normalize the vectors to unit length
          const normalizeVector = (vec: number[]) => {
            const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
            return magnitude === 0 ? vec : vec.map(val => val / magnitude);
          };

          const normalizedQuery = normalizeVector(queryEmbedding);
          const normalizedWorkspace = normalizeVector(embeddingArray);

          // Calculate dot product directly (vectors are already normalized)
          const similarity = normalizedQuery.reduce((sum, val, i) => sum + val * normalizedWorkspace[i], 0);
          
          console.log(`Workspace ${summary.workspace_id} similarity: ${similarity}`);
          
          return {
            ...summary,
            similarity
          };
        } catch (error) {
          console.error('Error processing workspace:', summary.workspace_id, error);
          return null;
        }
      })
      .filter((summary): summary is NonNullable<typeof summary> => 
        summary !== null && !isNaN(summary.similarity) && summary.similarity >= 0.2
      )
      .sort((a, b) => b.similarity - a.similarity);

    console.log('Workspaces with scores:', workspacesWithScores);
    
    const workspaces = workspacesWithScores.slice(0, 1);

    console.log('Selected workspaces:', workspaces);

    if (!workspaces.length) {
      return NextResponse.json({ error: 'No matching workspace found' }, { status: 404 })
    }

    const workspaceId = workspaces[0].workspace_id

    // Get workspace name
    const { data: workspaceData, error: workspaceNameError } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', workspaceId)
      .single()

    if (workspaceNameError) throw workspaceNameError

    // Get messages from this workspace's channels
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        content,
        channels!inner(
          id,
          name,
          workspace_id
        )
      `)
      .eq('channels.workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (messagesError) throw messagesError

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages found in workspace' }, { status: 404 })
    }

    // Group messages by channel
    const channelMessages = messages.reduce<Record<string, ChannelSummary>>((acc, msg) => {
      const channel = msg.channels as unknown as Channel
      const channelId = channel.id
      if (!acc[channelId]) {
        acc[channelId] = {
          id: channelId,
          name: channel.name,
          messages: []
        }
      }
      acc[channelId].messages.push(msg.content)
      return acc
    }, {})

    // Create channel summaries and find best match
    const channelSummaries = Object.values(channelMessages).map(channel => ({
      id: channel.id,
      name: channel.name,
      summary: `Channel: ${channel.name}\nRecent messages: ${channel.messages.slice(0, 5).join(' | ')}`
    }))

    const [bestMatch] = await Promise.all([
      embeddings.embedDocuments(channelSummaries.map(c => c.summary))
    ]).then(([embeddings]) => {
      return channelSummaries
        .map((channel, i) => ({
          ...channel,
          similarity: 1 - cosineSimilarity(queryEmbedding, embeddings[i])
        }))
        .sort((a, b) => b.similarity - a.similarity)
    })

    return NextResponse.json({
      channelId: bestMatch.id,
      channelName: bestMatch.name,
      workspaceId,
      workspaceName: workspaceData.name
    })

  } catch (error) {
    console.error('Error finding channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]) {
  try {
    console.log('Vector lengths:', a.length, b.length)
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    console.log('Dot product:', dotProduct)
    
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    console.log('Magnitudes:', magnitudeA, magnitudeB)

    // Prevent division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
      console.log('Zero magnitude detected')
      return 0
    }

    const similarity = dotProduct / (magnitudeA * magnitudeB)
    console.log('Similarity:', similarity)
    return similarity
  } catch (error) {
    console.error('Error in cosine similarity:', error)
    return 0
  }
} 