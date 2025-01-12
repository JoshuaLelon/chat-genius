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
  const [currentUser, setCurrentUser] = useState(users[0])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0])
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>(undefined)
  const [activeUserId, setActiveUserId] = useState<string | undefined>(undefined) // Replaced activeDmId

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId')
    if (userId) {
      const user = users.find(u => u.id === userId)
      if (user) {
        setCurrentUser(user)
        setIsLoggedIn(true)
        // Set the active workspace to the first workspace the user is a member of
        const userWorkspace = workspaces.find(w => w.users.some(u => u.id === user.id))
        if (userWorkspace) {
          // Load persisted user statuses
          const storedStatuses = JSON.parse(localStorage.getItem('userStatuses') || '{}')
          const updatedWorkspace = {
            ...userWorkspace,
            users: userWorkspace.users.map(u => ({
              ...u,
              status: storedStatuses[u.id] || u.status
            }))
          }
          setActiveWorkspace(updatedWorkspace)
          // Set the first channel of the workspace as active
          if (updatedWorkspace.channels.length > 0) {
            setActiveChannelId(updatedWorkspace.channels[0].id)
            router.push(`/chat/channel/${updatedWorkspace.channels[0].id}`)
          }
        }
      } else {
        handleLogout()
      }
    } else {
      handleLogout()
    }
  }, [])

  useEffect(() => {
    const channelMatch = pathname.match(/\/chat\/channel\/(.+)/)
    const userMatch = pathname.match(/\/chat\/dm\/(.+)/)
    
    if (channelMatch) {
      setActiveChannelId(channelMatch[1])
      setActiveUserId(undefined)
    } else if (userMatch) {
      setActiveUserId(userMatch[1])
      setActiveChannelId(undefined)
    }
  }, [pathname])

  useEffect(() => {
    console.log('Current Route:', pathname)
    console.log('User Statuses:')
    activeWorkspace.users.forEach(user => {
      console.log(`${user.username}: ${user.status}`)
    })
  }, [pathname, activeWorkspace])

  const handleLogout = () => {
    localStorage.removeItem('currentUserId')
    setIsLoggedIn(false)
    router.push('/') // Redirect to the login page
  }

  const handleWorkspaceSelect = (workspaceId: string) => {
    const newWorkspace = workspaces.find(w => w.id === workspaceId)
    if (newWorkspace) {
      setActiveWorkspace(newWorkspace)
      // Reset active channel and DM when switching workspaces
      setActiveChannelId(undefined)
      setActiveUserId(undefined) // Replaced activeDmId
      // Redirect to the first channel of the new workspace
      if (newWorkspace.channels.length > 0) {
        const firstChannelId = newWorkspace.channels[0].id
        setActiveChannelId(firstChannelId)
        router.push(`/chat/channel/${firstChannelId}`)
      }
    }
    console.log('Workspace Selected:', { workspaceId, newWorkspace: newWorkspace ? newWorkspace.name : null });
  }

  if (!isLoggedIn) {
    return null // Or a loading spinner if you prefer
  }

  console.log('ChatLayout State:', {
    isLoggedIn,
    currentUser: currentUser.username,
    activeWorkspace: activeWorkspace ? { id: activeWorkspace.id, name: activeWorkspace.name } : null,
    activeChannelId,
    activeUserId // Replaced activeDmId
  });

  return (
    <ChatProvider initialWorkspace={activeWorkspace} currentUser={currentUser}>
      <div className="grid h-screen grid-cols-[280px_1fr]">
        <Sidebar
          activeWorkspace={activeWorkspace}
          currentUser={currentUser}
          onLogout={handleLogout}
          activeChannelId={activeChannelId}
          activeUserId={activeUserId} // Replaced activeDmId
          onWorkspaceSelect={handleWorkspaceSelect}
        />
        {children}
      </div>
    </ChatProvider>
  )
}
