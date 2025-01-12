"use client"

import { Channel, DirectMessage, Message, User, Workspace } from "@/types"
import React, { createContext, useContext, useState, useEffect } from "react"

interface ChatContextType {
  workspace: Workspace
  currentUser: User
  addMessage: (channelId: string | null, dmUserId: string | null, newMessage: Message) => void
  updateMessage: (channelId: string | null, dmUserId: string | null, messageId: string, updatedMessage: Message) => void
  removeMessage: (channelId: string | null, dmUserId: string | null, messageId: string) => void
  updateUserStatus: (userId: string, newStatus: 'online' | 'offline' | 'busy') => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children, initialWorkspace, currentUser }: { children: React.ReactNode; initialWorkspace: Workspace; currentUser: User }) {
  const [workspace, setWorkspace] = useState(initialWorkspace)

  useEffect(() => {
    setWorkspace(initialWorkspace)
  }, [initialWorkspace])

  const addMessage = (channelId: string | null, dmUserId: string | null, newMessage: Message) => {
    setWorkspace((prevWorkspace) => {
      const newWorkspace = { ...prevWorkspace }

      if (channelId) {
        const channelIndex = newWorkspace.channels.findIndex((c) => c.id === channelId)
        if (channelIndex !== -1) {
          newWorkspace.channels[channelIndex] = {
            ...newWorkspace.channels[channelIndex],
            messages: [...newWorkspace.channels[channelIndex].messages, newMessage]
          }
        }
      } else if (dmUserId) {
        const dmIndex = newWorkspace.directMessages.findIndex((dm) => 
          dm.participants.includes(currentUser.id) && dm.participants.includes(dmUserId)
        )
        if (dmIndex !== -1) {
          newWorkspace.directMessages[dmIndex] = {
            ...newWorkspace.directMessages[dmIndex],
            messages: [...newWorkspace.directMessages[dmIndex].messages, newMessage]
          }
        } else {
          // Create a new DM if it doesn't exist
          newWorkspace.directMessages.push({
            id: `dm_${currentUser.id}_${dmUserId}`,
            participants: [currentUser.id, dmUserId],
            messages: [newMessage]
          })
        }
      }

      return newWorkspace
    })
  }

  const updateMessage = (channelId: string | null, dmUserId: string | null, messageId: string, updatedMessage: Message) => {
    setWorkspace((prevWorkspace) => {
      const newWorkspace = { ...prevWorkspace }

      if (channelId) {
        const channelIndex = newWorkspace.channels.findIndex((c) => c.id === channelId)
        if (channelIndex !== -1) {
          newWorkspace.channels[channelIndex] = {
            ...newWorkspace.channels[channelIndex],
            messages: newWorkspace.channels[channelIndex].messages.map(m => 
              m.id === messageId ? updatedMessage : m
            )
          }
        }
      } else if (dmUserId) {
        const dmIndex = newWorkspace.directMessages.findIndex((dm) => 
          dm.participants.includes(currentUser.id) && dm.participants.includes(dmUserId)
        )
        if (dmIndex !== -1) {
          newWorkspace.directMessages[dmIndex] = {
            ...newWorkspace.directMessages[dmIndex],
            messages: newWorkspace.directMessages[dmIndex].messages.map(m => 
              m.id === messageId ? updatedMessage : m
            )
          }
        }
      }

      return newWorkspace
    })
  }

  const removeMessage = (channelId: string | null, dmUserId: string | null, messageId: string) => {
    setWorkspace((prevWorkspace) => {
      const newWorkspace = { ...prevWorkspace };

      if (channelId) {
        const channelIndex = newWorkspace.channels.findIndex((c) => c.id === channelId);
        if (channelIndex !== -1) {
          newWorkspace.channels[channelIndex] = {
            ...newWorkspace.channels[channelIndex],
            messages: newWorkspace.channels[channelIndex].messages.filter((m) => m.id !== messageId),
          };
        }
      } else if (dmUserId) {
        const dmIndex = newWorkspace.directMessages.findIndex((dm) =>
          dm.participants.includes(currentUser.id) && dm.participants.includes(dmUserId)
        );
        if (dmIndex !== -1) {
          newWorkspace.directMessages[dmIndex] = {
            ...newWorkspace.directMessages[dmIndex],
            messages: newWorkspace.directMessages[dmIndex].messages.filter((m) => m.id !== messageId),
          };
        }
      }

      return newWorkspace;
    });
  };

  const updateUserStatus = (userId: string, newStatus: 'online' | 'offline' | 'busy') => {
    setWorkspace((prevWorkspace) => {
      const newWorkspace = { ...prevWorkspace }
      const userIndex = newWorkspace.users.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        newWorkspace.users[userIndex] = {
          ...newWorkspace.users[userIndex],
          status: newStatus
        }
      }
      // Persist the updated status in localStorage
      const storedStatuses = JSON.parse(localStorage.getItem('userStatuses') || '{}')
      storedStatuses[userId] = newStatus
      localStorage.setItem('userStatuses', JSON.stringify(storedStatuses))
      return newWorkspace
    })
  }

  // Load persisted user statuses on initial render
  useEffect(() => {
    const storedStatuses = JSON.parse(localStorage.getItem('userStatuses') || '{}')
    setWorkspace((prevWorkspace) => {
      const newWorkspace = { ...prevWorkspace }
      newWorkspace.users = newWorkspace.users.map(user => ({
        ...user,
        status: storedStatuses[user.id] || user.status
      }))
      return newWorkspace
    })
  }, [])

  return <ChatContext.Provider value={{ 
    workspace, 
    currentUser, 
    addMessage, 
    updateMessage, 
    removeMessage,
    updateUserStatus
  }}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}

