"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isLoading) {
      console.log("[MessageInput] Ignoring submit:", {
        content: content.trim(),
        isLoading
      });
      return
    }

    console.log("[MessageInput] Submitting message:", {
      content,
      isLoading
    });

    try {
      setIsLoading(true)
      await onSendMessage(content)
      console.log("[MessageInput] Message sent successfully");
      setContent("")
    } catch (error) {
      console.error("[MessageInput] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      console.log("[MessageInput] Enter key pressed (no shift)");
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[200px]"
          disabled={isLoading}
        />
        <Button type="submit" disabled={!content.trim() || isLoading}>
          Send
        </Button>
      </div>
    </form>
  )
}

