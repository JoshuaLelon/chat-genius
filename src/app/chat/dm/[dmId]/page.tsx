"use client"

import { ChatArea } from "@/components/chat/chat-area"
import { useChatContext } from "@/contexts/ChatContext"
import { notFound } from "next/navigation"

export default function DMPage({ params }: { params: { dmId: string } }) {
  const { workspace, currentUser } = useChatContext()
  const dm = workspace.directMessages.find(d => d.id === params.dmId)

  if (!dm || !dm.participants.some(p => p.id === currentUser.id)) {
    notFound()
  }

  const otherUser = dm.participants.find(user => user.id !== currentUser.id)

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h1 className="text-xl font-semibold">{otherUser?.username}</h1>
      </div>
      <ChatArea channelId={null} dmId={params.dmId} />
    </div>
  )
}

