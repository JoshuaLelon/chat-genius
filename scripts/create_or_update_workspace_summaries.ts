import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from '@langchain/openai'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
})

async function generateWorkspaceSummary(workspaceId: string): Promise<string> {
  // Get workspace details
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single()
    .throwOnError()

  // Get channels in workspace
  const { data: channels } = await supabase
    .from('channels')
    .select('name')
    .eq('workspace_id', workspaceId)
    .throwOnError()

  // Get recent messages from channels
  const { data: messages } = await supabase
    .from('messages')
    .select('content, channels!inner(name)')
    .eq('channels.workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(100)
    .throwOnError()

  // Create summary text
  const summary = `Workspace: ${workspace?.name || 'Unknown'}\n` +
    `Channels: ${(channels || []).map(c => c.name).join(', ')}\n` +
    `Recent discussion topics: ${(messages || [])
      .map(m => m.content)
      .slice(0, 10)
      .join(' | ')}`

  return summary
}

export async function main() {
  // Get all workspaces
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id')

  if (error) {
    console.error('Error fetching workspaces:', error)
    process.exit(1)
  }

  for (const workspace of workspaces) {
    try {
      // Generate summary
      const summary = await generateWorkspaceSummary(workspace.id)
      
      // Generate embedding
      const [embedding] = await embeddings.embedDocuments([summary])

      // Upsert summary and embedding
      const { error: upsertError } = await supabase
        .from('vectorized_workspace_summaries')
        .upsert({
          workspace_id: workspace.id,
          summary,
          embedding,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'workspace_id'
        })

      if (upsertError) {
        console.error(`Error upserting summary for workspace ${workspace.id}:`, upsertError)
        continue
      }

      console.log(`Updated summary for workspace ${workspace.id}`)
    } catch (err) {
      console.error(`Error processing workspace ${workspace.id}:`, err)
    }
  }
}

// Only run if this is the main module
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => process.exit())
} 