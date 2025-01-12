"use client"

import { Message, User } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { formatDate } from "@/utils/dateFormat"

interface MessageBubbleProps {
  message: Message
  currentUser: User
  onUpdate: (messageId: string, content: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
}

export function MessageBubble({ message, currentUser, onUpdate, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isLoading, setIsLoading] = useState(false)

  const isOwner = message.user_id === currentUser.id
  const user = message.user || { username: 'Unknown User', avatar_url: undefined }

  const handleUpdate = async () => {
    if (!editContent.trim() || isLoading) return

    try {
      setIsLoading(true)
      await onUpdate(message.id, editContent)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      await onDelete(message.id)
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{user.username}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(message.created_at)}
          </span>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[40px]"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={!editContent.trim() || isLoading}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(message.content)
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {isOwner && (
              <div className="absolute -right-2 top-0 hidden gap-1 group-hover:flex">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 