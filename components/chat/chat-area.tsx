"use client"

import { ChatMessage } from "@/components/chat/message"
import { MessageInput } from "@/components/chat/message-input"
import { useChatContext } from "@/contexts/ChatContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { subscribeToChannelMessages, subscribeToMessageReactions, unsubscribeFromChannelMessages } from "@/lib/supabase"
import { Message } from "@/types"

interface ChatAreaProps {
  channelId: string | null
  dmId: string | null
}

export function ChatArea({ channelId, dmId }: ChatAreaProps) {
  const { workspace, currentUser } = useChatContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setIsLoading(true)
    setMessages([])

    // Initialize messages from workspace
    const initialMessages = channelId
      ? workspace.channels.find(c => c.id === channelId)?.messages || []
      : workspace.directMessages.find(d => 
          d.participants.includes(currentUser.id) && 
          d.participants.includes(dmId!)
        )?.messages || []
    
    setMessages(initialMessages)

    // Subscribe to real-time updates
    let messageSubscription: any
    if (channelId) {
      messageSubscription = subscribeToChannelMessages(channelId, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old?.id))
        }
      })
    }

    // Set up reaction subscriptions for each message
    const reactionSubscriptions = messages.map(message => 
      subscribeToMessageReactions(message.id, (payload) => {
        setMessages(prev => prev.map(m => {
          if (m.id === message.id) {
            if (payload.eventType === 'INSERT') {
              return { ...m, reactions: [...m.reactions, payload.new] }
            } else if (payload.eventType === 'UPDATE') {
              return { ...m, reactions: m.reactions.map(r => r.id === payload.new.id ? payload.new : r) }
            } else if (payload.eventType === 'DELETE') {
              return { ...m, reactions: m.reactions.filter(r => r.id !== payload.old?.id) }
            }
          }
          return m
        }))
      })
    )

    const timer = setTimeout(() => setIsLoading(false), 500)

    return () => {
      clearTimeout(timer)
      if (channelId) {
        unsubscribeFromChannelMessages(channelId)
      }
      reactionSubscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [channelId, dmId, workspace, currentUser.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Skeleton className="h-[80px] w-full" />
        </div>
      </div>
    )
  }

  const conversationName = channelId
    ? workspace.channels.find(c => c.id === channelId)?.name
    : workspace.users.find(u => u.id === dmId)?.username

  if (!conversationName) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    )
  }

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
                dmId={dmId}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <MessageInput channelId={channelId} dmId={dmId} />
    </div>
  )
}

