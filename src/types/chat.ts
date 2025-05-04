
export type MessageStatus = "sent" | "delivered" | "read";

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  reactions: Reaction[];
}

export interface User {
  id: string;
  full_name: string;
  // avatar?: string;
  profile_photo?: string;
  status?: "online" | "offline";
  email?: string;
  lastSeen?: string;
  lastMessage?: string;
  unreadCount?: number;

}
