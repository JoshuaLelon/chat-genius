"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  dmUserId?: string  // Add dmUserId prop for DM context
}

export function MessageInput({ onSendMessage, dmUserId }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

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
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIResponse = async () => {
    if (!content.trim() || !dmUserId || isGeneratingAI) return;

    try {
      setIsGeneratingAI(true);
      const response = await fetch("/api/ai-respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: dmUserId, question: content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate AI response");
      }

      const { response: aiResponse } = await response.json();
      await onSendMessage(content); // Send the original message
      await onSendMessage(aiResponse); // Send the AI response
      setContent("");
    } catch (error) {
      console.error("[MessageInput] AI response error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate AI response");
    } finally {
      setIsGeneratingAI(false);
    }
  };

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
          disabled={isLoading || isGeneratingAI}
        />
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            disabled={!content.trim() || isLoading || isGeneratingAI}
          >
            Send
          </Button>
          {dmUserId && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleAIResponse}
              disabled={!content.trim() || isGeneratingAI || isLoading}
            >
              AI Response
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

