import { Channel, DirectMessage, Message, User, Workspace } from "@/types"

// Helper function to generate a random message
function generateMessage(user: User, content: string): Message {
  return {
    id: Math.random().toString(36).substr(2, 9),
    content,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    user,
    reactions: []
  }
}

// Helper functions remain unchanged

// Create 15 users with passwords
export const users: User[] = [
  { id: "1", username: "alicejohnson", avatar: "/placeholder.svg?height=40&width=40", status: "online", password: "alice123" },
  { id: "2", username: "bobsmith", avatar: "/placeholder.svg?height=40&width=40", status: "busy", password: "bob123" },
  { id: "3", username: "charliebrown", avatar: "/placeholder.svg?height=40&width=40", status: "offline", password: "charlie123" },
  { id: "4", username: "dianaprince", avatar: "/placeholder.svg?height=40&width=40", status: "online", password: "diana123" },
  { id: "5", username: "ethanhunt", avatar: "/placeholder.svg?height=40&width=40", status: "busy", password: "ethan123" },
  { id: "6", username: "fionaapple", avatar: "/placeholder.svg?height=40&width=40", status: "offline", password: "fiona123" },
  { id: "7", username: "georgeclooney", avatar: "/placeholder.svg?height=40&width=40", status: "online", password: "george123" },
  { id: "8", username: "hannahmontana", avatar: "/placeholder.svg?height=40&width=40", status: "busy", password: "hannah123" },
  { id: "9", username: "ianmckellen", avatar: "/placeholder.svg?height=40&width=40", status: "offline", password: "ian123" },
  { id: "10", username: "juliaroberts", avatar: "/placeholder.svg?height=40&width=40", status: "online", password: "julia123" },
  { id: "11", username: "kevinbacon", avatar: "/placeholder.svg?height=40&width=40", status: "busy", password: "kevin123" },
  { id: "12", username: "laracroft", avatar: "/placeholder.svg?height=40&width=40", status: "offline", password: "lara123" },
  { id: "13", username: "michaelscott", avatar: "/placeholder.svg?height=40&width=40", status: "online", password: "michael123" },
  { id: "14", username: "natalieportman", avatar: "/placeholder.svg?height=40&width=40", status: "busy", password: "natalie123" },
  { id: "15", username: "oscarwilde", avatar: "/placeholder.svg?height=40&width=40", status: "offline", password: "oscar123" },
]

// Function to generate DMs between two users
function generateDMs(user1Id: string, user2Id: string): DirectMessage {
  return {
    id: `dm_${user1Id}_${user2Id}`,
    participants: [users.find(u => u.id === user1Id)!, users.find(u => u.id === user2Id)!],
    messages: [
      generateMessage(users.find(u => u.id === user1Id)!, `Hey, got a minute?`),
      generateMessage(users.find(u => u.id === user2Id)!, `Sure, what's up?`),
      generateMessage(users.find(u => u.id === user1Id)!, "I need your opinion on this new design/code I'm working on."),
      generateMessage(users.find(u => u.id === user2Id)!, "Of course! Send it over and I'll take a look."),
    ]
  }
}

// Create workspaces
export const workspaces: Workspace[] = [
  {
    id: "1",
    name: "Design Workspace",
    channels: [
      {
        id: "d1",
        name: "cool designers",
        messages: [
          generateMessage(users[0], "Hey cool designers! What's the latest trend?"),
          generateMessage(users[1], "Neumorphism is making a comeback!"),
          generateMessage(users[2], "I thought we all agreed never to speak of that again..."),
        ]
      },
      {
        id: "d2",
        name: "uncool designers",
        messages: [
          generateMessage(users[3], "Is comic sans still cool?"),
          generateMessage(users[4], "It never was, dianaprince."),
          generateMessage(users[5], "Hey, be nice! We're all learning here."),
        ]
      }
    ],
    directMessages: [
      generateDMs("1", "2"),
      generateDMs("1", "3"),
      generateDMs("2", "3"),
      generateDMs("2", "4"),
      generateDMs("3", "4"),
      generateDMs("4", "5"),
    ],
    users: users.slice(0, 10)
  },
  {
    id: "2",
    name: "Engineering Workspace",
    channels: [
      {
        id: "e1",
        name: "hardcore engineers",
        messages: [
          generateMessage(users[6], "Who's up for a 48-hour hackathon?"),
          generateMessage(users[7], "I'm in! Let's build a blockchain for pet rocks!"),
          generateMessage(users[8], "You two need sleep. And therapy."),
        ]
      },
      {
        id: "e2",
        name: "softy engineers",
        messages: [
          generateMessage(users[9], "Has anyone tried coding with a nice cup of tea?"),
          generateMessage(users[10], "Tea? I prefer a warm glass of milk and a bedtime story."),
          generateMessage(users[11], "You're all adorable. Pass the cookies, please."),
        ]
      }
    ],
    directMessages: [
      generateDMs("6", "7"),
      generateDMs("6", "8"),
      generateDMs("7", "8"),
      generateDMs("7", "9"),
      generateDMs("8", "9"),
      generateDMs("9", "10"),
    ],
    users: [...users.slice(5, 15)]
  }
]

export type { Channel, DirectMessage, Message, User, Workspace }

interface DirectMessage {
  id: string;
  participants: User[];
  messages: Message[];
}

