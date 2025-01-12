import { ScrollArea } from "@/components/ui/scroll-area"
import { Workspace, User } from "@/types"
import { Button } from "@/components/ui/button"

interface WorkspaceListProps {
  workspaces: Workspace[]
  currentUser: User
  activeWorkspaceId: string
  onWorkspaceSelect: (workspaceId: string) => void
}

export function WorkspaceList({ workspaces, currentUser, activeWorkspaceId, onWorkspaceSelect }: WorkspaceListProps) {
  const userWorkspaces = workspaces.filter(workspace => 
    workspace.users.some(user => user.id === currentUser.id)
  )

  return (
    <div>
      <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
        Workspaces
      </h2>
      <ScrollArea className="h-[100px]">
        <div className="space-y-1 p-2">
          {userWorkspaces.map((workspace) => (
            <Button
              key={workspace.id}
              onClick={() => onWorkspaceSelect(workspace.id)}
              className={`w-full justify-start ${
                workspace.id === activeWorkspaceId 
                  ? 'bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              variant={workspace.id === activeWorkspaceId ? "secondary" : "ghost"}
            >
              {workspace.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

