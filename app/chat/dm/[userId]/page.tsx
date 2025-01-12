"use client"

import { ChatArea } from "@/components/chat/chat-area"
import { useChatContext } from "@/contexts/ChatContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DMPage({ params }: { params: { userId: string } }) {
  const { workspace, currentUser } = useChatContext()
  const router = useRouter()
  const [otherUser, setOtherUser] = useState(workspace.users.find(u => u.id === params.userId));

  useEffect(() => {
    const findUser = () => {
      const user = workspace.users.find(u => u.id === params.userId);
      setOtherUser(user);
    }

    findUser();

    const intervalId = setInterval(findUser, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [workspace, params.userId]);


  useEffect(() => {
    if (!otherUser) {
      // If the user doesn't exist in the current workspace, redirect to the first channel
      const firstChannel = workspace.channels[0]
      if (firstChannel) {
        router.push(`/chat/channel/${firstChannel.id}`)
      } else {
        // If there are no channels, redirect to the main chat page
        router.push('/chat')
      }
    }
  }, [workspace, params.userId, router, otherUser])

  console.log('DMPage Rendered:', {
    userId: params.userId,
    workspace: { id: workspace.id, name: workspace.name },
    currentUser: currentUser.username,
    otherUser: otherUser ? otherUser.username : null
  });

  if (!otherUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h1 className="text-xl font-semibold">{otherUser.username}</h1>
      </div>
      <ChatArea channelId={null} dmId={params.userId} />
    </div>
  )
}
