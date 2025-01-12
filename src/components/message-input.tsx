"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatContext } from "@/contexts/ChatContext"
import { SendHorizontal } from 'lucide-react'
import { useState, KeyboardEvent } from "react"

interface MessageInputProps {
  channelId: string | null
  userId: string | null
}

export function MessageInput({ channelId, userId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const { currentUser, addMessage } = useChatContext()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content: message.trim(),
      sender: currentUser,
      timestamp: new Date().toISOString()
    }

    addMessage(channelId, userId, newMessage)
    setMessage("")
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  )
}

