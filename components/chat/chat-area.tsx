"use client"

import { Message, User } from "@/types"
import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { useChatContext } from "@/contexts/ChatContext"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatAreaProps {
  channelId?: string
  dmUserId?: string
}

export function ChatArea({ channelId, dmUserId }: ChatAreaProps) {
  const { workspace, currentUser, addMessage, updateMessage, removeMessage } = useChatContext()
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = channelId
    ? workspace.channels.find(c => c.id === channelId)?.messages || []
    : workspace.directMessages.find(dm =>
        dm.participants.some(p => p.id === dmUserId) &&
        dm.participants.some(p => p.id === currentUser.id)
      )?.messages || []

  const conversationName = channelId
    ? workspace.channels.find(c => c.id === channelId)?.name
    : workspace.users.find(u => u.id === dmUserId)?.username

  useEffect(() => {
    // Simulate loading for smoother transitions
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [channelId, dmUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    try {
      await addMessage(channelId || null, dmUserId || null, content)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleUpdateMessage = async (messageId: string, content: string) => {
    try {
      await updateMessage(channelId || null, dmUserId || null, messageId, content)
    } catch (error) {
      console.error("Error updating message:", error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await removeMessage(channelId || null, dmUserId || null, messageId)
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!conversationName) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUser={currentUser}
            onUpdate={handleUpdateMessage}
            onDelete={handleDeleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

