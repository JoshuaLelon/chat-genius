"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { ChatProvider } from "@/contexts/ChatContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Workspace, User } from "@/types"
import { supabase, getWorkspace } from "@/lib/supabase"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>(undefined)
  const [activeUserId, setActiveUserId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          handleLogout();
          return;
        }

        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile) {
          handleLogout();
          return;
        }

        setCurrentUser(profile);

        // Fetch user's workspaces from Supabase
        try {
          const { data: workspaces, error } = await supabase
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (workspaces && workspaces.length > 0) {
            // Get the first workspace's full data
            const workspaceData = await getWorkspace(workspaces[0].id);
            setActiveWorkspace(workspaceData);
            // Set the first channel of the workspace as active
            if (workspaceData.channels.length > 0) {
              setActiveChannelId(workspaceData.channels[0].id);
              router.push(`/chat/channel/${workspaceData.channels[0].id}`);
            }
          }
        } catch (error) {
          console.error('Error fetching workspaces:', error);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveWorkspace(null);
    router.push('/');
  }

  const handleWorkspaceSelect = async (workspaceId: string) => {
    try {
      const workspaceData = await getWorkspace(workspaceId);
      setActiveWorkspace(workspaceData);
      // Reset active channel and DM when switching workspaces
      setActiveChannelId(undefined);
      setActiveUserId(undefined);
      // Redirect to the first channel of the new workspace
      if (workspaceData.channels.length > 0) {
        const firstChannelId = workspaceData.channels[0].id;
        setActiveChannelId(firstChannelId);
        router.push(`/chat/channel/${firstChannelId}`);
      }
      console.log('Workspace Selected:', { workspaceId, workspaceName: workspaceData.name });
    } catch (error) {
      console.error('Error fetching workspace:', error);
    }
  }

  if (isLoading || !currentUser || !activeWorkspace) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

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

