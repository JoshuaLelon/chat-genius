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
      console.log("[ChatLayout] Starting session check...");
      try {
        console.log("[ChatLayout] Getting session from Supabase...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[ChatLayout] Session result:", { session, sessionError });

        if (sessionError) {
          console.error("[ChatLayout] Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("[ChatLayout] No session found, logging out...");
          handleLogout();
          return;
        }

        console.log("[ChatLayout] Session found, getting user profile...");
        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log("[ChatLayout] Profile query result:", { profile, profileError });

        if (profileError) {
          console.error("[ChatLayout] Profile error:", profileError);
          throw profileError;
        }

        if (!profile) {
          console.log("[ChatLayout] No profile found, logging out...");
          handleLogout();
          return;
        }

        console.log("[ChatLayout] Setting current user:", profile);
        setCurrentUser(profile);

        // Fetch user's workspaces from Supabase
        try {
          console.log("[ChatLayout] Fetching workspaces...");
          const { data: workspaces, error } = await supabase
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false });

          console.log("[ChatLayout] Workspaces result:", { workspaces, error });

          if (error) {
            console.error("[ChatLayout] Workspaces error:", error);
            throw error;
          }

          if (workspaces && workspaces.length > 0) {
            console.log("[ChatLayout] Found workspaces, getting first workspace data...");
            // Get the first workspace's full data
            const workspaceData = await getWorkspace(workspaces[0].id);
            console.log("[ChatLayout] First workspace data:", workspaceData);
            setActiveWorkspace(workspaceData);
            
            // Set the first channel of the workspace as active
            if (workspaceData.channels.length > 0) {
              const firstChannelId = workspaceData.channels[0].id;
              console.log("[ChatLayout] Setting first channel as active:", firstChannelId);
              setActiveChannelId(firstChannelId);
              router.push(`/chat/channel/${firstChannelId}`);
            }
          }
        } catch (error) {
          console.error('[ChatLayout] Error fetching workspaces:', error);
        }
      } catch (error) {
        console.error('[ChatLayout] Error checking session:', error);
        handleLogout();
      } finally {
        console.log("[ChatLayout] Session check completed");
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    console.log("[ChatLayout] Pathname changed:", pathname);
    const channelMatch = pathname.match(/\/chat\/channel\/(.+)/)
    const userMatch = pathname.match(/\/chat\/dm\/(.+)/)
    
    if (channelMatch) {
      console.log("[ChatLayout] Setting active channel:", channelMatch[1]);
      setActiveChannelId(channelMatch[1])
      setActiveUserId(undefined)
    } else if (userMatch) {
      console.log("[ChatLayout] Setting active user:", userMatch[1]);
      setActiveUserId(userMatch[1])
      setActiveChannelId(undefined)
    }
  }, [pathname])

  const handleLogout = async () => {
    console.log("[ChatLayout] Logging out...");
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveWorkspace(null);
    console.log("[ChatLayout] Redirecting to home...");
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

