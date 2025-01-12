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
        console.log("[WorkspaceList] Fetching workspaces for user:", currentUser.id);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          console.log("[WorkspaceList] No session found, clearing workspaces");
          setWorkspaces([]);
          return;
        }

        // First get the workspace IDs the user is a member of
        const { data: memberWorkspaces, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', currentUser.id);

        if (memberError) throw memberError;

        const workspaceIds = memberWorkspaces.map(m => m.workspace_id);
        console.log("[WorkspaceList] User's workspace IDs:", workspaceIds);

        // Then get the workspace details
        const { data: workspaces, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds)
          .order('created_at', { ascending: false });

        if (workspacesError) throw workspacesError;
        console.log("[WorkspaceList] Fetched workspaces:", workspaces);
        setWorkspaces(workspaces || []);
      } catch (error) {
        console.error('[WorkspaceList] Error fetching workspaces:', error);
        setWorkspaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [currentUser.id]);

  const handleWorkspaceSelect = (workspaceId: string) => {
    console.log("[WorkspaceList] Workspace selected:", workspaceId);
    console.log("[WorkspaceList] Current active workspace:", activeWorkspaceId);
    onWorkspaceSelect(workspaceId);
  };

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
              onClick={() => handleWorkspaceSelect(workspace.id)}
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

