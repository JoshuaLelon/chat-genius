"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Workspace } from "@/types"
import { updateUserStatus as updateUserStatusInDb } from "@/lib/supabase"

type UserStatus = 'online' | 'offline' | 'busy'

interface ChatContextType {
  workspace: Workspace | null
  updateUserStatus: (status: UserStatus) => Promise<void>
  onWorkspaceSelect: (workspaceId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: React.ReactNode
  initialWorkspace: Workspace | null
  onWorkspaceSelect: (workspaceId: string) => Promise<void>
}

export function ChatProvider({ children, initialWorkspace, onWorkspaceSelect }: ChatProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(initialWorkspace)
  
  useEffect(() => {
    console.log("[ChatContext] Workspace changed:", {
      from: workspace?.name,
      to: initialWorkspace?.name,
      fromId: workspace?.id,
      toId: initialWorkspace?.id
    })
    
    if (initialWorkspace?.id) {
      setWorkspace(initialWorkspace)
      updateUserStatusInDb(initialWorkspace.id, 'online' as UserStatus)
        .catch(err => console.error('[ChatContext] Error updating user status:', err))
    }
  }, [initialWorkspace?.id])

  const updateUserStatus = useCallback(async (status: UserStatus) => {
    if (!workspace?.id) return
    
    try {
      await updateUserStatusInDb(workspace.id, status)
      console.log('[ChatContext] User status updated:', { workspaceId: workspace.id, status })
    } catch (error) {
      console.error('[ChatContext] Error updating user status:', error)
    }
  }, [workspace?.id])

  return (
    <ChatContext.Provider value={{ workspace, updateUserStatus, onWorkspaceSelect }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
} 