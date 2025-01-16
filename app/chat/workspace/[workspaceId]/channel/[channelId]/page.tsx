"use client"

import { ChatArea } from "@/components/chat/chat-area"
import { useChatContext } from "@/contexts/ChatContext"
import { useEffect, useState } from "react"
import { Channel } from "@/types"
import { useRouter } from "next/navigation"

export default function WorkspaceChannelPage({ 
  params 
}: { 
  params: { 
    workspaceId: string
    channelId: string 
  } 
}) {
  const { workspace } = useChatContext()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('[WorkspaceChannelPage] useEffect triggered:', {
      workspaceId: params.workspaceId,
      channelId: params.channelId,
      currentWorkspaceId: workspace.id,
      workspaceName: workspace.name,
      currentChannels: workspace.channels.map(c => ({ id: c.id, name: c.name })),
    });

    setIsLoading(true)

    // Verify we're in the correct workspace
    if (workspace.id !== params.workspaceId) {
      console.log('[WorkspaceChannelPage] Wrong workspace, redirecting:', {
        currentWorkspaceId: workspace.id,
        requestedWorkspaceId: params.workspaceId
      });
      router.push(`/chat/workspace/${workspace.id}/channel/${workspace.channels[0].id}`);
      return;
    }

    // Find the channel in the current workspace
    const foundChannel = workspace.channels.find(c => c.id === params.channelId)
    
    if (foundChannel) {
      console.log('[WorkspaceChannelPage] Found channel in workspace:', {
        channelId: foundChannel.id,
        channelName: foundChannel.name,
        workspaceId: workspace.id,
        workspaceName: workspace.name
      })
      setChannel(foundChannel)
    } else {
      console.log('[WorkspaceChannelPage] Channel not found in workspace:', {
        searchedChannelId: params.channelId,
        availableChannels: workspace.channels.map(c => ({ id: c.id, name: c.name })),
        workspaceId: workspace.id,
        workspaceName: workspace.name
      })
      // Redirect to first channel in workspace
      const firstChannel = workspace.channels[0]
      if (firstChannel) {
        router.push(`/chat/workspace/${workspace.id}/channel/${firstChannel.id}`)
      } else {
        router.push('/chat')
      }
      return
    }

    setIsLoading(false)
  }, [workspace, params.workspaceId, params.channelId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading channel...</div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Channel not found. Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h1 className="text-xl font-semibold">#{channel.name}</h1>
      </div>
      <ChatArea channelId={params.channelId} />
    </div>
  )
} 