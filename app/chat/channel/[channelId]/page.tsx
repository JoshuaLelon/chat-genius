"use client"

import { ChatArea } from "@/components/chat/chat-area"
import { useChatContext } from "@/contexts/ChatContext"
import { useEffect, useState } from "react"
import { Channel } from "@/types"
import { useRouter } from "next/navigation"

export default function ChannelPage({ params }: { params: { channelId: string } }) {
  const { workspace } = useChatContext()
  const [channel, setChannel] = useState<Channel | null>(null)
  const router = useRouter()

  useEffect(() => {
    const foundChannel = workspace.channels.find(c => c.id === params.channelId)
    if (foundChannel) {
      setChannel(foundChannel)
    } else {
      // If the channel doesn't exist in the current workspace, redirect to the first channel
      const firstChannel = workspace.channels[0]
      if (firstChannel) {
        router.push(`/chat/channel/${firstChannel.id}`)
      } else {
        // If there are no channels, redirect to the main chat page
        router.push('/chat')
      }
    }
  }, [workspace, params.channelId, router])

  console.log('ChannelPage Rendered:', {
    channelId: params.channelId,
    workspace: { id: workspace.id, name: workspace.name },
    channel: channel ? { id: channel.id, name: channel.name } : null
  });

  if (!channel) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h1 className="text-xl font-semibold">#{channel.name}</h1>
      </div>
      <ChatArea channelId={params.channelId} dmId={null} />
    </div>
  )
}

