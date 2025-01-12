"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatContext } from "@/contexts/ChatContext"
import { SendHorizontal } from 'lucide-react'
import { useState, KeyboardEvent } from "react"
import { toast } from "sonner"
import { createMessage } from "@/lib/supabase"

interface MessageInputProps {
  channelId: string | null
  dmId: string | null
}

export function MessageInput({ channelId, dmId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { currentUser } = useChatContext()

  const sendMessage = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      if (channelId) {
        await createMessage({
          content: message.trim(),
          channel_id: channelId,
          user_id: currentUser.id
        })
      } else if (dmId) {
        await createMessage({
          content: message.trim(),
          dm_id: dmId,
          user_id: currentUser.id
        })
      }
      setMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="flex items-end gap-2 border-t bg-background p-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="min-h-[80px]"
        disabled={isSending}
      />
      <Button 
        type="submit" 
        className="h-[80px] bg-[#b0e6ff] text-black hover:bg-[#b0e6ff]/90"
        disabled={isSending}
      >
        <SendHorizontal className={`h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
      </Button>
    </form>
  )
}

