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

interface WorkspaceSummary {
  workspace_id: string
  summary: string
  embedding: number[]
  workspaces: Workspace
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    // Embed the search query
    const [queryEmbedding] = await embeddings.embedDocuments([query])

    // Find most relevant workspace
    const { data: workspaces } = await supabase
      .from('vectorized_workspace_summaries')
      .select(`
        workspace_id,
        summary,
        embedding,
        workspaces:workspaces!inner (
          name
        )
      `)
      .order(`embedding <=> '${queryEmbedding}'::vector`)
      .limit(1)
      .throwOnError()

    if (!workspaces?.length) {
      return NextResponse.json({ error: 'No matching workspace found' }, { status: 404 })
    }

    const workspaceId = workspaces[0].workspace_id
    const workspaceName = workspaces[0].workspaces?.[0]?.name

    // Get messages from this workspace's channels
    const { data: messages } = await supabase
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
      .throwOnError()

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
      workspaceName
    })

  } catch (error) {
    console.error('Error finding channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
} 