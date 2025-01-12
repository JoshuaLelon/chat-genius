import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Workspace } from "@/types"
import { Circle } from 'lucide-react'
import Link from "next/link"
import { ChannelList } from "./channel-list"
import { UserStatus } from "./user-status"
import { WorkspaceList } from "./workspace-list"

interface SidebarProps {
  activeWorkspace: Workspace
  activeChannelId?: string
  activeUserId?: string
  currentUser: any
  onLogout: () => void
  onWorkspaceSelect: (workspaceId: string) => void
}

export function Sidebar({ activeWorkspace, activeChannelId, activeUserId, currentUser, onLogout, onWorkspaceSelect }: SidebarProps) {
  const relevantDMs = activeWorkspace.directMessages.filter(dm => 
    dm.participants.some(p => p.id === currentUser.id)
  )

  console.log('[Sidebar] Rendering with:', {
    workspaceId: activeWorkspace.id,
    workspaceName: activeWorkspace.name,
    channelCount: activeWorkspace.channels.length,
    channels: activeWorkspace.channels.map(c => ({ id: c.id, name: c.name })),
    currentUser: currentUser?.email,
    activeChannelId,
    activeUserId
  });

  console.log('[Sidebar] Available DM Links:', activeWorkspace.users
    .filter(user => user.id !== currentUser.id)
    .map(user => ({ userId: user.id, email: user.email })));

  console.log('[Sidebar] Available Channel Links:', activeWorkspace.channels
    .map(channel => ({ id: channel.id, name: channel.name })));

  return (
    <div className="flex h-full flex-col border-r bg-muted/50">
      <UserStatus user={currentUser} onLogout={onLogout} />
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <WorkspaceList 
            currentUser={currentUser} 
            activeWorkspaceId={activeWorkspace.id}
            onWorkspaceSelect={onWorkspaceSelect}
          />
          <div>
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Channels
            </h2>
            {activeWorkspace.channels.length > 0 ? (
              <ChannelList
                channels={activeWorkspace.channels}
                activeChannelId={activeChannelId}
              />
            ) : (
              <p className="px-2 text-sm text-muted-foreground">No channels in this workspace</p>
            )}
          </div>
          <div>
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Direct Messages
            </h2>
            <div className="space-y-1">
              {activeWorkspace.users
                .filter(user => user.id !== currentUser.id)
                .map((user) => (
                  <Link
                    key={user.id}
                    href={`/chat/dm/${user.id}`}
                    className={`flex items-center rounded-md px-2 py-1 hover:bg-muted ${
                      user.id === activeUserId 
                        ? 'bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Circle className={`mr-2 h-2 w-2 ${
                      user.status === 'online' ? 'fill-green-500 text-green-500' :
                      user.status === 'busy' ? 'fill-yellow-500 text-yellow-500' :
                      'fill-gray-500 text-gray-500'
                    }`} />
                    {user.email.split('@')[0]}
                  </Link>
                ))
              }
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

