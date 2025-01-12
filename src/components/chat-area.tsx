"use client"

import { ChatMessage } from "@/components/chat/message"
import { MessageInput } from "@/components/chat/message-input"
import { useChatContext } from "@/contexts/ChatContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"

interface ChatAreaProps {
  channelId: string | null
  userId: string | null
}

export function ChatArea({ channelId, userId }: ChatAreaProps) {
  const { workspace, currentUser } = useChatContext()
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = channelId
    ? workspace.channels.find(c => c.id === channelId)?.messages || []
    : workspace.directMessages.find(d => 
        d.participants.some(p => p.id === userId) && 
        d.participants.some(p => p.id === currentUser.id)
      )?.messages || []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4" ref={scrollRef}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                currentUser={currentUser} 
                channelId={channelId}
                userId={userId}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <MessageInput channelId={channelId} userId={userId} />
    </div>
  )
}

