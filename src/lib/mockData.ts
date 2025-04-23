
import { User, Message } from "@/types/chat";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg",
    status: "online",
    lastMessage: "Hey, how's it going?",
    unreadCount: 2
  },
  {
    id: "user-2",
    name: "Bob Smith",
    avatar: "/placeholder.svg",
    status: "offline",
    lastSeen: "2 hours ago",
    lastMessage: "Can we talk about the project?",
  },
  {
    id: "user-3",
    name: "Carol White",
    avatar: "/placeholder.svg",
    status: "online",
    lastMessage: "Thanks for your help!",
  },
  {
    id: "user-4",
    name: "Dave Brown",
    avatar: "/placeholder.svg",
    status: "offline",
    lastSeen: "yesterday",
    lastMessage: "I'll get back to you soon.",
  },
  {
    id: "user-5",
    name: "Eve Green",
    avatar: "/placeholder.svg",
    status: "online",
    lastMessage: "Looking forward to our meeting!",
    unreadCount: 1
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-1",
    text: "Hey, how's it going?",
    timestamp: new Date(new Date().getTime() - 3600000).toISOString(),
    status: "read",
    reactions: []
  },
  {
    id: "msg-2",
    senderId: "current-user",
    text: "I'm good! Just working on that new project we discussed.",
    timestamp: new Date(new Date().getTime() - 3500000).toISOString(),
    status: "read",
    reactions: [
      {
        userId: "user-1",
        emoji: "👍",
        timestamp: new Date(new Date().getTime() - 3400000).toISOString()
      }
    ]
  },
  {
    id: "msg-3",
    senderId: "user-1",
    text: "That's great! How's the progress so far?",
    timestamp: new Date(new Date().getTime() - 3300000).toISOString(),
    status: "read",
    reactions: []
  },
  {
    id: "msg-4",
    senderId: "current-user",
    text: "It's coming along well. I've completed about 70% of the tasks. I'm working on the design now.",
    timestamp: new Date(new Date().getTime() - 3200000).toISOString(),
    status: "read",
    reactions: [
      {
        userId: "user-1",
        emoji: "🎉",
        timestamp: new Date(new Date().getTime() - 3100000).toISOString()
      }
    ]
  },
  {
    id: "msg-5",
    senderId: "user-1",
    text: "That's impressive! Let me know if you need any help with the design part.",
    timestamp: new Date(new Date().getTime() - 1800000).toISOString(),
    status: "read",
    reactions: []
  },
  {
    id: "msg-6",
    senderId: "current-user",
    text: "Thanks! I'll definitely reach out if I get stuck.",
    timestamp: new Date(new Date().getTime() - 1700000).toISOString(),
    status: "read",
    reactions: []
  },
];

export const mockNotifications = [
  {
    id: "notif-1",
    type: "message",
    userName: "Alice Johnson",
    userAvatar: "/placeholder.svg",
    timeAgo: "2 minutes ago",
    unread: true
  },
  {
    id: "notif-2",
    type: "reaction",
    userName: "Bob Smith",
    userAvatar: "/placeholder.svg",
    timeAgo: "15 minutes ago",
    unread: true
  },
  {
    id: "notif-3",
    type: "message",
    userName: "Carol White",
    userAvatar: "/placeholder.svg",
    timeAgo: "1 hour ago",
    unread: false
  },
  {
    id: "notif-4",
    type: "reaction",
    userName: "Dave Brown",
    userAvatar: "/placeholder.svg",
    timeAgo: "3 hours ago",
    unread: false
  }
];

export const commonEmojis = [
  "👍", "👎", "❤️", "😂", "😢", "😡", "🎉", "👏",
  "🙌", "🤔", "👀", "✅", "❌", "🔥", "💯", "⭐",
  "🚀", "💪", "👋", "🤝", "🙏", "💬", "📝", "📌",
  "🎯", "🏆", "💰", "⏰", "📞", "📧", "🔍", "💡"
];
