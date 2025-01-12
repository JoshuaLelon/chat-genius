import { ScrollArea } from "@/components/ui/scroll-area"
import { Workspace, User } from "@/types"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface WorkspaceListProps {
  currentUser: User
  activeWorkspaceId: string
  onWorkspaceSelect: (workspaceId: string) => void
}

export function WorkspaceList({ currentUser, activeWorkspaceId, onWorkspaceSelect }: WorkspaceListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          setWorkspaces([]);
          return;
        }

        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWorkspaces(data || []);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        setWorkspaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
          Workspaces
        </h2>
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
        Workspaces
      </h2>
      <ScrollArea className="h-[100px]">
        <div className="space-y-1 p-2">
          {workspaces.map((workspace) => (
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

