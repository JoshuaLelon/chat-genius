"use client"

import { Channel, DirectMessage, Message, Reaction, User, Workspace } from "@/types"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { supabase, getWorkspace, createMessage, updateUserStatus, getUser, subscribeToWorkspace } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface ChatContextType {
  workspace: Workspace
  currentUser: User
  addMessage: (channelId: string | null, dmUserId: string | null, content: string) => Promise<void>
  addTemporaryMessage: (dmUserId: string, content: string, isAI?: boolean, recallScore?: number) => void
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

  // Sort messages in initial workspace
  const sortedWorkspace = {
    ...initialWorkspace,
    channels: initialWorkspace.channels.map(channel => ({
      ...channel,
      messages: [...channel.messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })),
    directMessages: initialWorkspace.directMessages.map(dm => ({
      ...dm,
      messages: [...dm.messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }))
  };

  const [workspace, setWorkspace] = useState<Workspace>(sortedWorkspace)
  const router = useRouter()
  const tempMessageCounter = useRef(0);

  console.log("[ChatProvider] Initializing with:", {
    workspaceId: initialWorkspace.id,
    workspaceName: initialWorkspace.name,
    currentUser: currentUser.email,
    channelCount: initialWorkspace.channels.length,
    dmCount: initialWorkspace.directMessages.length
  });

  // Track current user's presence
  useEffect(() => {
    const updateStatus = async () => {
      console.log("[ChatProvider] Setting initial user status to online:", {
        userId: currentUser.id,
        email: currentUser.email
      });
      await updateUserStatus(currentUser.id, 'online');
    };
    updateStatus();
  }, [currentUser.id]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("[ChatProvider] Setting user status to offline before unload:", {
        userId: currentUser.id,
        email: currentUser.email
      });
      updateUserStatus(currentUser.id, 'offline');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser.id]);

  useEffect(() => {
    console.log("[ChatContext] Workspace changed:", {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      channelCount: workspace.channels.length,
      channels: workspace.channels.map(c => ({
        id: c.id,
        name: c.name,
        messageCount: c.messages.length,
        reactionCount: c.messages.reduce((acc, m) => acc + (m.reactions?.length || 0), 0)
      })),
      dmCount: workspace.directMessages.length,
      dms: workspace.directMessages.map(dm => ({
        id: dm.id,
        participants: dm.participants.map(p => p.email),
        messageCount: dm.messages.length,
        reactionCount: dm.messages.reduce((acc, m) => acc + (m.reactions?.length || 0), 0)
      }))
    });
  }, [workspace])

  useEffect(() => {
    if (!workspace?.id) return;

    const subscription = subscribeToWorkspace(workspace.id, (type, payload) => {
      console.log("[ChatContext] Received subscription update:", { type, payload });
      
      setWorkspace(current => {
        const updated = structuredClone(current);
        
        if (type === 'messages') {
          const { new: message, old: oldMessage, eventType } = payload;
          console.log("[ChatContext] Processing message update:", { 
            eventType, 
            messageId: message?.id,
            messageContent: message?.content,
            channelId: message?.channel_id,
            dmId: message?.dm_id,
            existingMessages: updated.directMessages
              .find(dm => dm.id === message?.dm_id)
              ?.messages.map(m => ({ id: m.id, content: m.content }))
          });
          
          // Update channels
          updated.channels = updated.channels.map(channel => {
            if (channel.id === message?.channel_id) {
              if (eventType === 'INSERT') {
                // Find any temporary message with matching content and user
                const tempMessage = channel.messages.find(m => 
                  m.id.startsWith('temp-') && 
                  m.content === message.content &&
                  m.user_id === message.user_id
                );
                
                if (tempMessage) {
                  // Replace temp message with real one
                  channel.messages = channel.messages.map(m =>
                    m.id === tempMessage.id ? message : m
                  );
                } else {
                  // If no temp message found, add the new one
                  channel.messages = [...channel.messages, message];
                }
                
                // Sort messages by timestamp
                channel.messages = channel.messages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                
                console.log("[ChatContext] Updated channel messages:", {
                  channelId: channel.id,
                  messageCount: channel.messages.length,
                  messages: channel.messages.map(m => ({
                    id: m.id,
                    content: m.content,
                    isTemp: m.id.startsWith('temp-')
                  }))
                });
              } else if (eventType === 'DELETE') {
                channel.messages = channel.messages.filter(m => m.id !== oldMessage.id);
              } else if (eventType === 'UPDATE') {
                channel.messages = channel.messages.map(m => 
                  m.id === message.id ? message : m
                );
              }
            }
            return channel;
          });
          
          // Update DMs similarly
          updated.directMessages = updated.directMessages.map(dm => {
            if (dm.id === message?.dm_id) {
              if (eventType === 'INSERT') {
                // Find any temporary message with matching content and user
                const tempMessage = dm.messages.find(m => 
                  m.id.startsWith('temp-') && 
                  m.content === message.content &&
                  m.user_id === message.user_id
                );
                
                if (tempMessage) {
                  console.log("[ChatContext] Found temp message to replace:", {
                    tempId: tempMessage.id,
                    realId: message.id,
                    content: message.content
                  });
                  // Replace temp message with real one
                  dm.messages = dm.messages.map(m =>
                    m.id === tempMessage.id ? message : m
                  );
                } else {
                  console.log("[ChatContext] No temp message found, adding new message");
                  // If no temp message found, add the new one
                  dm.messages = [...dm.messages, message];
                }
                
                // Sort messages by timestamp
                dm.messages = dm.messages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                
                // Remove any duplicate messages
                dm.messages = dm.messages.filter((message, index, self) =>
                  index === self.findIndex((m) => m.id === message.id)
                );
                
                console.log("[ChatContext] Updated DM messages:", {
                  dmId: dm.id,
                  messageCount: dm.messages.length,
                  messages: dm.messages.map(m => ({
                    id: m.id,
                    content: m.content,
                    isTemp: m.id.startsWith('temp-')
                  }))
                });
              } else if (eventType === 'DELETE') {
                dm.messages = dm.messages.filter(m => m.id !== oldMessage.id);
              } else if (eventType === 'UPDATE') {
                dm.messages = dm.messages.map(m => 
                  m.id === message.id ? message : m
                );
              }
            }
            return dm;
          });
        }
        
        return updated;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [workspace?.id]);

  const addMessage = async (channelId: string | null, dmUserId: string | null, content: string) => {
    if (!content.trim()) {
      console.log("[ChatContext] Ignoring empty message");
      return
    }

    console.log("[ChatContext] Adding message:", {
      channelId,
      dmUserId,
      content: content.trim(),
      currentUser: currentUser.email,
      workspaceId: workspace.id
    });

    try {
      // Create optimistic message
      const newCounter = tempMessageCounter.current + 1;
      tempMessageCounter.current = newCounter;
      
      const optimisticMessage = {
        id: `temp-${Date.now()}-${newCounter}`,
        content: content.trim(),
        user_id: currentUser.id,
        created_at: new Date().toISOString(),
        sender: currentUser,
        reactions: [],
        channel_id: channelId || undefined,
        dm_id: undefined
      };

      // Optimistically update UI
      setWorkspace(prev => {
        const updated = { ...prev };
        if (channelId) {
          const channelIndex = updated.channels.findIndex(c => c.id === channelId);
          if (channelIndex !== -1) {
            updated.channels[channelIndex] = {
              ...updated.channels[channelIndex],
              messages: [...updated.channels[channelIndex].messages, optimisticMessage]
            };
          }
        } else if (dmUserId) {
          const dmIndex = updated.directMessages.findIndex(dm =>
            dm.participants.some(p => p.id === dmUserId) &&
            dm.participants.some(p => p.id === currentUser.id)
          );

          if (dmIndex !== -1) {
            updated.directMessages[dmIndex] = {
              ...updated.directMessages[dmIndex],
              messages: [...updated.directMessages[dmIndex].messages, optimisticMessage]
            };
          }
        }
        return updated;
      });

      // Send to server
      if (channelId) {
        await createMessage({
          content: content.trim(),
          channel_id: channelId,
          user_id: currentUser.id
        });
      } else if (dmUserId) {
        // Find or create DM
        const existingDM = workspace.directMessages.find(dm =>
          dm.participants.some(p => p.id === dmUserId) &&
          dm.participants.some(p => p.id === currentUser.id)
        );

        if (existingDM) {
          await createMessage({
            content: content.trim(),
            dm_id: existingDM.id,
            user_id: currentUser.id
          });
        } else {
          // Create new DM logic remains the same
          const { data: dm, error: dmError } = await supabase
            .from('direct_messages')
            .insert({ workspace_id: workspace.id })
            .select()
            .single();

          if (dmError) throw dmError;

          const { error: participantError } = await supabase.from('dm_participants').insert([
            { dm_id: dm.id, user_id: currentUser.id },
            { dm_id: dm.id, user_id: dmUserId }
          ]);

          if (participantError) throw participantError;

          await createMessage({
            content: content.trim(),
            dm_id: dm.id,
            user_id: currentUser.id
          });
        }
      }
    } catch (error) {
      console.error('[ChatContext] Error sending message:', error);
      // Revert optimistic update on error
      const updatedWorkspace = await getWorkspace(workspace.id);
      setWorkspace(updatedWorkspace);
      throw error;
    }
  };

  const addTemporaryMessage = (dmUserId: string, content: string, isAI: boolean = false, recallScore?: number) => {
    console.log("[ChatContext] Adding temporary message:", { 
      dmUserId, 
      content, 
      isAI, 
      recallScore,
      currentCounter: tempMessageCounter.current 
    });
    
    setWorkspace(current => {
      const updated = structuredClone(current);
      const dm = updated.directMessages.find(dm => 
        dm.participants.some(p => p.id === dmUserId) &&
        dm.participants.some(p => p.id === currentUser.id)
      );

      if (dm) {
        // Increment counter first
        const newCounter = tempMessageCounter.current + 1;
        tempMessageCounter.current = newCounter;
        
        console.log("[ChatContext] Creating temp message with ID:", {
          timestamp: Date.now(),
          counter: newCounter,
          fullId: `temp-${Date.now()}-${newCounter}`
        });

        const tempMessage: Message = {
          id: `temp-${Date.now()}-${newCounter}`,
          content,
          created_at: new Date().toISOString(),
          user_id: isAI ? dmUserId : currentUser.id,
          sender: isAI ? dm.participants.find(p => p.id === dmUserId)! : currentUser,
          reactions: [],
          is_ai: isAI,
          recallScore
        };

        console.log("[ChatContext] Current messages before adding:", {
          count: dm.messages.length,
          messages: dm.messages.map(m => ({
            id: m.id,
            content: m.content.substring(0, 50) + "..."
          }))
        });

        dm.messages = [...dm.messages, tempMessage].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Remove any duplicate messages
        dm.messages = dm.messages.filter((message, index, self) =>
          index === self.findIndex((m) => m.id === message.id)
        );

        console.log("[ChatContext] Messages after adding:", {
          count: dm.messages.length,
          messages: dm.messages.map(m => ({
            id: m.id,
            content: m.content.substring(0, 50) + "..."
          }))
        });
      }

      return updated;
    });
  };

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
      addTemporaryMessage,
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

