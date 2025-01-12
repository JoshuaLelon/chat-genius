"use client"

import { createContext, useContext, useState } from "react"
import { User, Workspace } from "@/types"
import { updateUserStatus as updateUserStatusInDb } from "@/lib/supabase"

interface ChatContextType {
  workspace: Workspace
  currentUser: User
  updateUserStatus: (newStatus: 'online' | 'offline' | 'busy') => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: React.ReactNode
  initialWorkspace: Workspace
  currentUser: User
}

export function ChatProvider({ children, initialWorkspace, currentUser }: ChatProviderProps) {
  const [workspace, setWorkspace] = useState(initialWorkspace)

  const updateUserStatus = async (newStatus: 'online' | 'offline' | 'busy') => {
    try {
      await updateUserStatusInDb(currentUser.id, newStatus)
      
      // Update workspace state
      setWorkspace(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === currentUser.id ? { ...user, status: newStatus } : user
        )
      }))
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  return (
    <ChatContext.Provider value={{ workspace, currentUser, updateUserStatus }}>
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