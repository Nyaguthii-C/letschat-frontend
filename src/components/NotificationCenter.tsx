import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, MessageSquare, Smile } from "lucide-react";
import { useState, useEffect } from "react";
import { BASE_URL_IP } from '@/api';

// Define the notification interface to match backend
interface Notification {
  id: string;
  type: 'new_message' | 'reaction';
  userName: string;
  userAvatar?: string | null;
  timeAgo: string;
  unread: boolean;
  content?: string;
  messageId?: number;
}

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter = ({ onClose }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const token = localStorage.getItem("access_token");
    const newSocket = new WebSocket(`ws://${BASE_URL_IP}/ws/notifications/?token=${token}`);

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'initial_notifications':
          setNotifications(data.notifications);
          break;
        case 'new_message':
        case 'reaction':
          // Add new notification to the top of the list
          setNotifications(prev => [
            {
              id: data.id || `notif-${Date.now()}`,
              type: data.type,
              userName: data.sender_data?.full_name || data.reactor_data?.full_name || 'Unknown',
              // userAvatar: data.sender_data?.profile_photo || data.reactor_data?.profile_photo,
              timeAgo: 'Just now',
              unread: true,
              content: data.content,
              messageId: data.message_id
            },
            ...prev
          ]);
          break;
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    // Send mark as seen to backend
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: 'mark_seen',
        notification_ids: [notificationId]
      }));

      // Remove notification from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notifications</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="max-h-80 overflow-auto">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className="flex items-start py-2 relative w-full text-left hover:bg-gray-50 rounded-lg px-2 transition-colors"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={notification.userAvatar || "/placeholder.svg"} 
                    alt={notification.userName} 
                  />
                  <AvatarFallback>{notification.userName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{notification.userName}</span>{" "}
                    {notification.type === "new_message" && "sent you a message"}
                    {notification.type === "reaction" && "reacted to your message"}
                  </p>
                  <p className="text-xs text-gray-500">{notification.timeAgo}</p>
                </div>
                <div className="ml-2 flex items-center justify-center h-8 w-8 bg-gray-100 rounded-full text-gray-500">
                  {notification.type === "new_message" && <MessageSquare className="h-4 w-4" />}
                  {notification.type === "reaction" && <Smile className="h-4 w-4" />}
                </div>
                {notification.unread && (
                  <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;