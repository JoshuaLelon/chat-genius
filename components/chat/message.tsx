"use client"

import { EmojiPicker } from "@/components/chat/emoji-picker"
import { useChatContext } from "@/contexts/ChatContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Message, User } from "@/types"
import { formatDate } from "@/utils/dateFormat"
import { toast } from "sonner"
import { useState } from "react"
import { addReaction, removeReaction, deleteMessage } from "@/lib/supabase"

interface ChatMessageProps {
  message: Message
  currentUser: User
  channelId: string | null
  dmId: string | null
}

export function ChatMessage({ message, currentUser, channelId, dmId }: ChatMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleReaction = async (emoji: string) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const existingReaction = message.reactions.find(r => r.emoji === emoji)
      
      if (existingReaction) {
        if (existingReaction.users.includes(currentUser.id)) {
          // Remove reaction
          await removeReaction(message.id, emoji)
        } else {
          // Add user to reaction
          await addReaction(message.id, emoji)
        }
      } else {
        // Add new reaction
        await addReaction(message.id, emoji)
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
      toast.error('Failed to update reaction. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await deleteMessage(message.id)
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="group flex gap-3 py-4 hover:bg-muted/50">
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user.avatar} alt={message.user.username} />
        <AvatarFallback>{message.user.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{message.user.username}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(message.timestamp)}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center gap-2">
          {message.reactions.map((reaction, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-6 gap-1 rounded-full px-2 text-xs"
              onClick={() => void handleReaction(reaction.emoji)}
              disabled={isUpdating}
            >
              {reaction.emoji} {reaction.users.length}
            </Button>
          ))}
          <EmojiPicker onEmojiSelect={(emoji) => void handleReaction(emoji)} />
          {message.user.id === currentUser.id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => void handleDelete()}
              disabled={isUpdating}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

