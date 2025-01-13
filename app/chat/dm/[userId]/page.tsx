"use client"

import { ChatArea } from "@/components/chat/chat-area"
import { useChatContext } from "@/contexts/ChatContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DMPage({ params }: { params: { userId: string } }) {
  const { workspace, currentUser } = useChatContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState(workspace.users.find(u => u.id === params.userId))

  useEffect(() => {
    const findUser = () => {
      setIsLoading(true)
      try {
        const user = workspace.users.find(u => u.id === params.userId)
        setOtherUser(user)
        if (!user) {
          setError('User not found in this workspace')
          // Redirect after a short delay to show the error message
          const timer = setTimeout(() => {
            const firstChannel = workspace.channels[0]
            if (firstChannel) {
              router.push(`/chat/channel/${firstChannel.id}`)
            } else {
              router.push('/chat')
            }
          }, 2000)
          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error('Error finding user:', error)
        setError('Failed to load user information')
      } finally {
        setIsLoading(false)
      }
    }

    findUser()
  }, [workspace, params.userId, router])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b px-4 py-2">
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">User not found</p>
          <p className="text-sm text-muted-foreground">Redirecting to main chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{otherUser.username}</h1>
          <span className={`h-2 w-2 rounded-full ${
            otherUser.status === 'online' ? 'bg-green-500' :
            otherUser.status === 'busy' ? 'bg-yellow-500' :
            'bg-gray-500'
          }`} />
        </div>
      </div>
      <ChatArea dmUserId={params.userId} />
    </div>
  )
}

