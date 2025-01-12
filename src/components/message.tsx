"use client"

import { EmojiPicker } from "@/components/chat/emoji-picker"
import { useChatContext } from "@/contexts/ChatContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Message, User } from "@/types"
import { formatDate } from "@/utils/dateFormat"

interface ChatMessageProps {
  message: Message
  currentUser: User
  channelId: string | null
  dmId: string | null
}

export function ChatMessage({ message, currentUser, channelId, dmId }: ChatMessageProps) {
  const { updateMessage } = useChatContext()

  const handleReaction = (emoji: string) => {
    const updatedMessage = { ...message }
    const existingReaction = updatedMessage.reactions.find(r => r.emoji === emoji)
    
    if (existingReaction) {
      if (existingReaction.users.includes(currentUser.id)) {
        existingReaction.users = existingReaction.users.filter(id => id !== currentUser.id)
        if (existingReaction.users.length === 0) {
          updatedMessage.reactions = updatedMessage.reactions.filter(r => r.emoji !== emoji)
        }
      } else {
        existingReaction.users.push(currentUser.id)
      }
    } else {
      updatedMessage.reactions.push({ emoji, users: [currentUser.id] })
    }

    updateMessage(channelId, dmId, message.id, updatedMessage)
  }

  return (
    <div className="group flex gap-3 py-4 hover:bg-muted/50">
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user.avatar} alt={message.user.username} />
        <AvatarFallback>{message.user.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
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
              onClick={() => handleReaction(reaction.emoji)}
            >
              {reaction.emoji} {reaction.users.length}
            </Button>
          ))}
          <EmojiPicker onEmojiSelect={handleReaction} />
        </div>
      </div>
    </div>
  )
}

