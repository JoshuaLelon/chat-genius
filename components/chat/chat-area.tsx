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
  const { workspace, currentUser, addMessage } = useChatContext()
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  console.log("[ChatArea] Rendering with:", {
    channelId,
    dmUserId,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    currentUser: currentUser.email
  });

  const messages = channelId
    ? workspace.channels.find(c => c.id === channelId)?.messages || []
    : workspace.directMessages.find(dm =>
        dm.participants.some(p => p.id === dmUserId) &&
        dm.participants.some(p => p.id === currentUser.id)
      )?.messages || []

  console.log("[ChatArea] Found messages:", messages.length);

  const conversationName = channelId
    ? workspace.channels.find(c => c.id === channelId)?.name
    : workspace.users.find(u => u.id === dmUserId)?.email?.split('@')[0]

  console.log("[ChatArea] Conversation name:", conversationName);

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
    console.log("[ChatArea] Sending message:", {
      channelId,
      dmUserId,
      content,
      currentUser: currentUser.email
    });

    try {
      await addMessage(channelId || null, dmUserId || null, content)
      console.log("[ChatArea] Message sent successfully");
    } catch (error) {
      console.error("[ChatArea] Error sending message:", error)
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
    console.log("[ChatArea] Conversation not found");
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Start a new conversation</p>
          </div>
          <div ref={messagesEndRef} />
        </div>
        <MessageInput onSendMessage={handleSendMessage} dmUserId={dmUserId} />
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
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} dmUserId={dmUserId} />
    </div>
  )
}

