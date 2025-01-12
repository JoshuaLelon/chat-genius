"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatContext } from "@/contexts/ChatContext"
import { SendHorizontal } from 'lucide-react'
import { useState, KeyboardEvent } from "react"

interface MessageInputProps {
  channelId: string | null
  dmId: string | null
}

export function MessageInput({ channelId, dmId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const { addMessage, currentUser } = useChatContext()

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        content: message.trim(),
        timestamp: new Date().toISOString(),
        user: currentUser,
        reactions: []
      }
      addMessage(channelId, dmId, newMessage)
      setMessage("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-end gap-2 border-t bg-background p-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="min-h-[80px]"
      />
      <Button type="submit" className="h-[80px] bg-[#b0e6ff] text-black hover:bg-[#b0e6ff]/90">
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  )
}

