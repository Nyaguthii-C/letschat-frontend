
export type MessageStatus = "sent" | "delivered" | "read";

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  reactions: Reaction[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
  lastSeen?: string;
  lastMessage?: string;
  unreadCount?: number;
}
