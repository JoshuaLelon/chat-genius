import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Channel } from "@/types"
import { Hash } from 'lucide-react'
import Link from "next/link"

interface ChannelListProps {
  channels: Channel[]
  activeChannelId?: string
}

export function ChannelList({ channels, activeChannelId }: ChannelListProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1 p-2">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={channel.id === activeChannelId ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              channel.id === activeChannelId 
                ? 'bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            asChild
          >
            <Link href={`/chat/channel/${channel.id}`}>
              <Hash className="mr-2 h-4 w-4" />
              {channel.name}
            </Link>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

