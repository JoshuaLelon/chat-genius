import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getWorkspace } from '@/lib/supabase'
import { Workspace } from '@/types'
import { ChatProvider } from '@/contexts/ChatContext'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [activeChannelId, setActiveChannelId] = useState<string>()
  const [activeUserId, setActiveUserId] = useState<string>()

  const handleWorkspaceSelect = async (workspaceId: string) => {
    try {
      console.log("[ChatLayout] Switching to workspace:", workspaceId)
      
      // Fetch new workspace data first
      const workspaceData = await getWorkspace(workspaceId)
      
      // Reset active states and update workspace state
      setActiveChannelId(undefined)
      setActiveUserId(undefined)
      setActiveWorkspace(workspaceData)
      
      // Navigate to first channel after state updates are complete
      if (workspaceData.channels.length > 0) {
        const firstChannelId = workspaceData.channels[0].id
        setActiveChannelId(firstChannelId)
        router.push(`/chat/channel/${firstChannelId}`)
      }
      
      console.log("[ChatLayout] Workspace switch complete:", { 
        workspaceId, 
        workspaceName: workspaceData.name,
        channelCount: workspaceData.channels.length 
      })
    } catch (error) {
      console.error('[ChatLayout] Error switching workspace:', error)
    }
  }

  return (
    <ChatProvider 
      initialWorkspace={activeWorkspace}
      onWorkspaceSelect={handleWorkspaceSelect}
    >
      {children}
    </ChatProvider>
  )
} 