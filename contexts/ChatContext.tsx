"use client"

import { Channel, DirectMessage, Message, User, Workspace } from "@/types"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, getWorkspace, createMessage, deleteMessage, updateUserStatus } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface ChatContextType {
  workspace: Workspace
  currentUser: User
  addMessage: (channelId: string | null, dmUserId: string | null, content: string) => Promise<void>
  updateMessage: (channelId: string | null, dmUserId: string | null, messageId: string, content: string) => Promise<void>
  removeMessage: (channelId: string | null, dmUserId: string | null, messageId: string) => Promise<void>
  updateUserStatus: (status: 'online' | 'offline' | 'busy') => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children, initialWorkspace, currentUser }: { children: React.ReactNode; initialWorkspace: Workspace; currentUser: User }) {
  const [workspace, setWorkspace] = useState(initialWorkspace)
  const router = useRouter()

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to workspace changes
    const workspaceSubscription = supabase
      .channel('workspace-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=in.(${workspace.channels.map(c => c.id).join(',')})`,
        },
        async (payload: any) => {
          // Refresh workspace data
          const updatedWorkspace = await getWorkspace(workspace.id)
          setWorkspace(updatedWorkspace)
        }
      )
      .subscribe()

    // Track current user's presence
    const trackPresence = async () => {
      await updateUserStatus(currentUser.id, 'online')
      window.addEventListener('beforeunload', () => {
        updateUserStatus(currentUser.id, 'offline')
      })
    }
    trackPresence()

    return () => {
      workspaceSubscription.unsubscribe()
      updateUserStatus(currentUser.id, 'offline')
    }
  }, [workspace.id, currentUser.id])

  const addMessage = async (channelId: string | null, dmUserId: string | null, content: string) => {
    if (!content.trim()) return

    try {
      if (channelId) {
        await createMessage({
          content: content.trim(),
          channel_id: channelId,
          user_id: currentUser.id
        })
      } else if (dmUserId) {
        // Find or create DM
        const existingDM = workspace.directMessages.find(dm =>
          dm.participants.some(p => p.id === dmUserId) &&
          dm.participants.some(p => p.id === currentUser.id)
        )

        if (existingDM) {
          await createMessage({
            content: content.trim(),
            dm_id: existingDM.id,
            user_id: currentUser.id
          })
        } else {
          // Create new DM
          const { data: dm } = await supabase
            .from('direct_messages')
            .insert({ workspace_id: workspace.id })
            .select()
            .single()

          await supabase.from('dm_participants').insert([
            { dm_id: dm.id, user_id: currentUser.id },
            { dm_id: dm.id, user_id: dmUserId }
          ])

          await createMessage({
            content: content.trim(),
            dm_id: dm.id,
            user_id: currentUser.id
          })
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const updateMessage = async (channelId: string | null, dmUserId: string | null, messageId: string, content: string) => {
    try {
      await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId)
        .eq('user_id', currentUser.id)
    } catch (error) {
      console.error('Error updating message:', error)
      throw error
    }
  }

  const removeMessage = async (channelId: string | null, dmUserId: string | null, messageId: string) => {
    try {
      await deleteMessage(messageId)
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  const updateStatus = async (status: 'online' | 'offline' | 'busy') => {
    try {
      await updateUserStatus(currentUser.id, status)
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  }

  return (
    <ChatContext.Provider value={{
      workspace,
      currentUser,
      addMessage,
      updateMessage,
      removeMessage,
      updateUserStatus: updateStatus
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

