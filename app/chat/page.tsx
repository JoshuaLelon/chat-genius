"use client"

import { useChatContext } from "@/contexts/ChatContext"

export default function ChatPage() {
  const { workspace } = useChatContext()

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Welcome to {workspace.name}</h1>
      {workspace.channels.length > 0 ? (
        <p>Please select a channel or direct message to start chatting.</p>
      ) : (
        <p>This workspace doesn't have any channels yet.</p>
      )}
    </div>
  )
}

