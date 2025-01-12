"use client"

import { EmojiPicker } from "@/components/chat/emoji-picker"
import { useChatContext } from "@/contexts/ChatContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Message, User } from "@/types"
import { formatDate } from "@/utils/dateFormat"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"

interface ChatMessageProps {
  message: Message
  currentUser: User
  channelId: string | null
  userId: string | null
}

export function ChatMessage({ message, currentUser, channelId, userId }: ChatMessageProps) {
  const { updateMessage } = useChatContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)

  const handleEdit = () => {
    if (editedContent.trim() !== message.content) {
      const updatedMessage = {
        ...message,
        content: editedContent.trim(),
        edited: true
      }
      updateMessage(channelId, userId, message.id, updatedMessage)
    }
    setIsEditing(false)
  }

  const isOwnMessage = message.sender.id === currentUser.id

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar>
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback>{message.sender.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{message.sender.username}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleEdit()
                }
              }}
              className="min-w-[200px]"
            />
            <Button onClick={handleEdit} size="sm">Save</Button>
            <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">Cancel</Button>
          </div>
        ) : (
          <div className="group relative">
            <p className="text-sm">{message.content}</p>
            {isOwnMessage && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

