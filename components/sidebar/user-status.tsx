"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/types"
import { Circle, LogOut } from 'lucide-react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useChatContext } from "@/contexts/ChatContext"

interface UserStatusProps {
  user: User
  onLogout: () => void
}

export function UserStatus({ user, onLogout }: UserStatusProps) {
  const { updateUserStatus, workspace } = useChatContext()
  const [status, setStatus] = useState(user.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  console.log("[UserStatus] Rendering with user:", user)
  console.log("[UserStatus] Current workspace:", workspace)

  useEffect(() => {
    console.log("[UserStatus] useEffect - workspace or user.id changed")
    const currentUserInWorkspace = workspace.users.find(u => u.id === user.id)
    console.log("[UserStatus] Current user in workspace:", currentUserInWorkspace)
    if (currentUserInWorkspace) {
      setStatus(currentUserInWorkspace.status)
    }
  }, [workspace, user.id])

  // Get display name - use email if username not available
  const displayName = user.username || user.email.split('@')[0]
  const displayInitial = displayName[0].toUpperCase()

  console.log("[UserStatus] Display name:", displayName)
  console.log("[UserStatus] Display initial:", displayInitial)

  const handleStatusChange = async (newStatus: 'online' | 'offline' | 'busy') => {
    if (isUpdating) return // Prevent multiple simultaneous updates
    
    try {
      setIsUpdating(true)
      console.log("[UserStatus] Updating status to:", newStatus)
      await updateUserStatus(newStatus)
      setStatus(newStatus)
      console.log("[UserStatus] Status updated successfully")
    } catch (error) {
      console.error('[UserStatus] Error updating status:', error)
      // Revert status on error
      setStatus(status)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = () => {
    onLogout()
    router.push('/') // Redirect to the login page
  }

  return (
    <div className="flex items-center gap-2 p-4">
      <Avatar>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{displayInitial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium">{displayName}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs text-muted-foreground"
              disabled={isUpdating}
            >
              {status && (
                <Circle className={`mr-1 h-2 w-2 ${
                  status === 'online' ? 'fill-green-400 text-green-400' :
                  status === 'busy' ? 'fill-yellow-400 text-yellow-400' :
                  'fill-muted-foreground text-muted-foreground'
                }`} />
              )}
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Loading...'}
              {isUpdating && '...'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem 
              onClick={() => handleStatusChange('online')}
              disabled={isUpdating}
            >
              <Circle className="mr-2 h-2 w-2 fill-green-400 text-green-400" />
              Online
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange('busy')}
              disabled={isUpdating}
            >
              <Circle className="mr-2 h-2 w-2 fill-yellow-400 text-yellow-400" />
              Busy
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange('offline')}
              disabled={isUpdating}
            >
              <Circle className="mr-2 h-2 w-2 fill-muted-foreground text-muted-foreground" />
              Offline
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

