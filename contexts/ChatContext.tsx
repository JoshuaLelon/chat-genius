"use client"

import { Channel, DirectMessage, Message, User, Workspace } from "@/types"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, getWorkspace, createMessage, updateUserStatus } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface ChatContextType {
  workspace: Workspace
  currentUser: User
  addMessage: (channelId: string | null, dmUserId: string | null, content: string) => Promise<void>
  updateUserStatus: (status: 'online' | 'offline' | 'busy') => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children, initialWorkspace, currentUser }: { children: React.ReactNode; initialWorkspace: Workspace; currentUser: User }) {
  console.log("[ChatContext] Initializing provider:", {
    workspaceId: initialWorkspace.id,
    workspaceName: initialWorkspace.name,
    currentUser: currentUser.email,
    channelCount: initialWorkspace.channels.length,
    dmCount: initialWorkspace.directMessages.length,
    channels: initialWorkspace.channels.map(c => ({ id: c.id, name: c.name }))
  })

  const [workspace, setWorkspace] = useState(initialWorkspace)
  const router = useRouter()

  console.log("[ChatProvider] Initializing with:", {
    workspaceId: initialWorkspace.id,
    workspaceName: initialWorkspace.name,
    currentUser: currentUser.email,
    channelCount: initialWorkspace.channels.length,
    dmCount: initialWorkspace.directMessages.length
  });

  // Set up real-time subscriptions
  useEffect(() => {
    console.log("[ChatProvider] Setting up subscriptions for workspace:", workspace.id);

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
          console.log("[ChatProvider] Received workspace change:", payload);
          // Refresh workspace data
          const updatedWorkspace = await getWorkspace(workspace.id)
          console.log("[ChatProvider] Updated workspace data:", {
            channelCount: updatedWorkspace.channels.length,
            dmCount: updatedWorkspace.directMessages.length
          });
          setWorkspace(updatedWorkspace)
        }
      )
      .subscribe()

    // Track current user's presence
    const trackPresence = async () => {
      console.log("[ChatProvider] Setting initial user status to online");
      await updateUserStatus(currentUser.id, 'online')
      window.addEventListener('beforeunload', () => {
        console.log("[ChatProvider] Setting user status to offline before unload");
        updateUserStatus(currentUser.id, 'offline')
      })
    }
    trackPresence()

    return () => {
      console.log("[ChatProvider] Cleaning up subscriptions");
      workspaceSubscription.unsubscribe()
      updateUserStatus(currentUser.id, 'offline')
    }
  }, [workspace.id, currentUser.id])

  useEffect(() => {
    console.log("[ChatContext] Workspace changed:", {
      workspaceId: initialWorkspace.id,
      workspaceName: initialWorkspace.name,
      channelCount: initialWorkspace.channels.length,
      channels: initialWorkspace.channels.map(c => ({ id: c.id, name: c.name }))
    })
    setWorkspace(initialWorkspace)
  }, [initialWorkspace])

  const addMessage = async (channelId: string | null, dmUserId: string | null, content: string) => {
    if (!content.trim()) {
      console.log("[ChatProvider] Ignoring empty message");
      return
    }

    console.log("[ChatProvider] Adding message:", {
      channelId,
      dmUserId,
      content: content.trim(),
      currentUser: currentUser.email
    });

    try {
      if (channelId) {
        await createMessage({
          content: content.trim(),
          channel_id: channelId,
          user_id: currentUser.id
        })
        console.log("[ChatProvider] Message added to channel:", channelId);
      } else if (dmUserId) {
        // Find or create DM
        const existingDM = workspace.directMessages.find(dm =>
          dm.participants.some(p => p.id === dmUserId) &&
          dm.participants.some(p => p.id === currentUser.id)
        )

        console.log("[ChatProvider] Found existing DM:", {
          exists: !!existingDM,
          dmId: existingDM?.id
        });

        if (existingDM) {
          await createMessage({
            content: content.trim(),
            dm_id: existingDM.id,
            user_id: currentUser.id
          })
          console.log("[ChatProvider] Message added to existing DM:", existingDM.id);
        } else {
          console.log("[ChatProvider] Creating new DM");
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
          console.log("[ChatProvider] Message added to new DM:", dm.id);
        }
      }
    } catch (error) {
      console.error('[ChatProvider] Error sending message:', error)
      throw error
    }
  }

  const updateStatus = async (status: 'online' | 'offline' | 'busy') => {
    try {
      console.log("[ChatProvider] Updating user status:", {
        userId: currentUser.id,
        email: currentUser.email,
        status
      });
      await updateUserStatus(currentUser.id, status)
      // Refresh workspace data to update UI
      const updatedWorkspace = await getWorkspace(workspace.id)
      console.log("[ChatProvider] Workspace updated after status change");
      setWorkspace(updatedWorkspace)
    } catch (error) {
      console.error('[ChatProvider] Error updating status:', error)
      throw error
    }
  }

  return (
    <ChatContext.Provider value={{
      workspace,
      currentUser,
      addMessage,
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

