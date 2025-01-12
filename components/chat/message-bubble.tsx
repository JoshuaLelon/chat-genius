"use client"

import { Message, User } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/utils/dateFormat"
import { Button } from "@/components/ui/button"
import { addReaction, removeReaction } from "@/lib/supabase"
import { useState } from "react"

interface MessageBubbleProps {
  message: Message
  currentUser: User
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const [isAddingReaction, setIsAddingReaction] = useState(false)

  console.log("[MessageBubble] Rendering message:", {
    messageId: message.id,
    content: message.content,
    userId: message.user_id,
    sender: message.sender,
    timestamp: message.created_at,
    reactionCount: message.reactions.length
  });

  // Get the sender's display name from the email (before the @)
  const displayName = message.sender?.email?.split('@')[0] || 'Unknown User'
  const initial = displayName[0].toUpperCase()

  // Group reactions by emoji
  const reactionGroups = message.reactions.reduce((groups, reaction) => {
    const emoji = reaction.emoji
    if (!groups[emoji]) {
      groups[emoji] = []
    }
    groups[emoji].push(reaction)
    return groups
  }, {} as Record<string, typeof message.reactions>)

  const handleAddReaction = async (emoji: string) => {
    console.log("[MessageBubble] Adding reaction:", {
      messageId: message.id,
      emoji,
      userId: currentUser.id
    });

    try {
      setIsAddingReaction(true)
      await addReaction(message.id, emoji, currentUser.id)
      console.log("[MessageBubble] Reaction added successfully");
    } catch (error) {
      console.error("[MessageBubble] Error adding reaction:", error)
    } finally {
      setIsAddingReaction(false)
    }
  }

  const handleRemoveReaction = async (emoji: string) => {
    console.log("[MessageBubble] Removing reaction:", {
      messageId: message.id,
      emoji,
      userId: currentUser.id
    });

    try {
      setIsAddingReaction(true)
      await removeReaction(message.id, emoji, currentUser.id)
      console.log("[MessageBubble] Reaction removed successfully");
    } catch (error) {
      console.error("[MessageBubble] Error removing reaction:", error)
    } finally {
      setIsAddingReaction(false)
    }
  }

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarImage src={message.sender?.avatar_url} />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(message.created_at)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(reactionGroups).map(([emoji, reactions]) => {
            const hasReacted = reactions.some(r => r.user_id === currentUser.id)
            return (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className="gap-1 px-2 py-0 h-6"
                onClick={() => hasReacted ? handleRemoveReaction(emoji) : handleAddReaction(emoji)}
                disabled={isAddingReaction}
              >
                <span>{emoji}</span>
                <span className="text-xs">{reactions.length}</span>
              </Button>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-0 h-6"
            onClick={() => handleAddReaction('👍')}
            disabled={isAddingReaction}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
} 