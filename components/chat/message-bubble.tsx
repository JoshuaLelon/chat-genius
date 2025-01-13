"use client"

import { Button } from "@/components/ui/button"
import { addReaction, removeReaction } from "@/lib/supabase"
import { useState, useMemo, useCallback } from "react"
import type { Message, Reaction, User } from "../../types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/utils/dateFormat"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

const EMOJI_LIST = ['👍', '❤️', '😂', '🎉', '🤔', '😢', '🔥', '👏', '✨', '🙌']

interface MessageBubbleProps {
  message: Message
  currentUser: User
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const [isAddingReaction, setIsAddingReaction] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [originalReactions, setOriginalReactions] = useState(message.reactions)

  console.log("[MessageBubble] Rendering message:", {
    messageId: message.id,
    content: message.content,
    userId: message.user_id,
    sender: message.sender,
    timestamp: message.created_at,
    reactionCount: message.reactions?.length || 0,
    reactions: message.reactions
  });

  // Get the sender's display name from the email (before the @)
  const displayName = message.sender?.email?.split('@')[0] || 'Unknown User'
  const initial = displayName[0].toUpperCase()

  // Group reactions by emoji
  const groupedReactions = useMemo(() => {
    console.log("[MessageBubble] Processing reactions for message:", {
      messageId: message.id,
      reactionCount: message.reactions?.length || 0
    });
    
    const groups: { [key: string]: Reaction[] } = {};
    message.reactions?.forEach(reaction => {
      console.log("[MessageBubble] Processing reaction:", {
        emoji: reaction.emoji,
        reactor: reaction.reactor?.email,
        message_id: reaction.message_id
      });
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = [];
      }
      groups[reaction.emoji].push(reaction);
    });
    
    console.log("[MessageBubble] Grouped reactions:", {
      messageId: message.id,
      groups: Object.keys(groups).reduce((acc, emoji) => ({
        ...acc,
        [emoji]: groups[emoji].length
      }), {})
    });
    
    return groups;
  }, [message.reactions, message.id]);

  const hasUserReacted = useCallback((emoji: string) => {
    const hasReacted = message.reactions?.some(
      r => r.emoji === emoji && r.user_id === currentUser.id
    ) ?? false;
   
    console.log("[MessageBubble] Checking if user reacted:", {
      messageId: message.id,
      emoji,
      userId: currentUser.id,
      hasReacted
    });
    
    return hasReacted;
  }, [message.reactions, currentUser.id, message.id]);

  const handleReaction = async (emoji: string) => {
    // Improved temporary message handling
    if (message.id.startsWith('temp-')) {
      toast.warning('Cannot react to messages that are still sending');
      return;
    }

    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      const hasReacted = message.reactions?.some(r => 
        r.emoji === emoji && r.user_id === currentUser.id
      );
      
      // Store original reactions before optimistic update
      setOriginalReactions(message.reactions || []);
      
      // Create optimistic reaction
      const optimisticReaction: Reaction = {
        id: `temp-${Date.now()}`,
        message_id: message.id,
        user_id: currentUser.id,
        emoji,
        reactor: currentUser
      };

      // Optimistically update UI
      const updatedReactions = hasReacted
        ? message.reactions?.filter(r => !(r.emoji === emoji && r.user_id === currentUser.id))
        : [...(message.reactions || []), optimisticReaction];

      message.reactions = updatedReactions;

      // Send to server
      if (hasReacted) {
        await removeReaction(message.id, emoji, currentUser.id);
      } else {
        await addReaction(message.id, emoji, currentUser.id);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
      // Revert using stored original reactions
      message.reactions = originalReactions;
    } finally {
      setIsUpdating(false);
    }
  };

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
          {Object.entries(groupedReactions).map(([emoji, reactions]) => {
            const hasReacted = hasUserReacted(emoji)
            return (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className="gap-1 px-2 py-0 h-6"
                onClick={() => handleReaction(emoji)}
                disabled={isAddingReaction}
              >
                <span>{emoji}</span>
                <span className="text-xs">{reactions.length}</span>
              </Button>
            )
          })}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 px-2 py-0 h-6"
                disabled={isAddingReaction}
              >
                <span>+</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-wrap gap-2">
                {EMOJI_LIST.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2 py-0 h-6"
                    onClick={() => handleReaction(emoji)}
                    disabled={isAddingReaction}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
} 