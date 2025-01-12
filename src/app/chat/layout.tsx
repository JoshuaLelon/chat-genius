"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { ChatProvider } from "@/contexts/ChatContext"
import { users, workspaces } from "@/lib/data"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Workspace, User } from "@/types"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>(undefined)
  const [activeUserId, setActiveUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Check if user is logged in
    const currentUserId = localStorage.getItem('currentUserId')
    if (!currentUserId) {
      router.push('/')
      return
    }

    // Find the user
    const user = users.find(u => u.id === currentUserId)
    if (!user) {
      localStorage.removeItem('currentUserId')
      router.push('/')
      return
    }

    setCurrentUser(user)
    setIsLoggedIn(true)
    setActiveWorkspace(workspaces[0])
  }, [router])

  useEffect(() => {
    // Extract channel ID from pathname
    const channelMatch = pathname.match(/\/chat\/channel\/(.+)/)
    if (channelMatch) {
      setActiveChannelId(channelMatch[1])
      setActiveUserId(undefined)
      return
    }

    // Extract user ID from pathname
    const userMatch = pathname.match(/\/chat\/dm\/(.+)/)
    if (userMatch) {
      setActiveUserId(userMatch[1])
      setActiveChannelId(undefined)
      return
    }

    // Reset both if we're on a different page
    setActiveChannelId(undefined)
    setActiveUserId(undefined)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('currentUserId')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setActiveWorkspace(null)
    setActiveChannelId(undefined)
    setActiveUserId(undefined)
    router.push('/')
  }

  const handleWorkspaceSelect = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId)
    if (workspace) {
      setActiveWorkspace(workspace)
      // Navigate to the first channel in the workspace
      if (workspace.channels.length > 0) {
        router.push(`/chat/channel/${workspace.channels[0].id}`)
      }
    }
  }

  if (!isLoggedIn || !currentUser || !activeWorkspace) {
    return null // Or a loading spinner if you prefer
  }

  console.log('ChatLayout State:', {
    isLoggedIn,
    currentUser: currentUser.username,
    activeWorkspace: activeWorkspace ? { id: activeWorkspace.id, name: activeWorkspace.name } : null,
    activeChannelId,
    activeUserId
  });

  return (
    <ChatProvider initialWorkspace={activeWorkspace} currentUser={currentUser}>
      <div className="grid h-screen grid-cols-[280px_1fr]">
        <Sidebar
          activeWorkspace={activeWorkspace}
          currentUser={currentUser}
          onLogout={handleLogout}
          activeChannelId={activeChannelId}
          activeUserId={activeUserId}
          onWorkspaceSelect={handleWorkspaceSelect}
        />
        {children}
      </div>
    </ChatProvider>
  )
}

