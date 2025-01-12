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
  const router = useRouter()

  useEffect(() => {
    const currentUserInWorkspace = workspace.users.find(u => u.id === user.id)
    if (currentUserInWorkspace) {
      setStatus(currentUserInWorkspace.status)
    }
  }, [workspace, user.id])

  const handleStatusChange = async (newStatus: 'online' | 'offline' | 'busy') => {
    setStatus(newStatus)
    await updateUserStatus(newStatus)
  }

  const handleLogout = () => {
    onLogout()
    router.push('/') // Redirect to the login page
  }

  return (
    <div className="flex items-center gap-2 p-4">
      <Avatar>
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium truncate">{user.email}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground">
              <Circle className={`mr-1 h-2 w-2 ${
                status === 'online' ? 'fill-green-400 text-green-400' :
                status === 'busy' ? 'fill-yellow-400 text-yellow-400' :
                'fill-muted-foreground text-muted-foreground'
              }`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleStatusChange('online')}>
              <Circle className="mr-2 h-2 w-2 fill-green-400 text-green-400" />
              Online
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('busy')}>
              <Circle className="mr-2 h-2 w-2 fill-yellow-400 text-yellow-400" />
              Busy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('offline')}>
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