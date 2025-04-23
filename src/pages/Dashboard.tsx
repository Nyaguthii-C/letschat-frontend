
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, MessageSquare, Smile, User, CircleDot } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import UserList from "@/components/UserList";
import NotificationCenter from "@/components/NotificationCenter";
import { mockUsers } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "@/types/chat";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<UserType>(mockUsers[0]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications] = useState(true);
  
  const handleLogout = () => {
    navigate("/login");
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">John Doe</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              {hasNewNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              <Bell className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Input placeholder="Search users..." className="bg-gray-50" />
        </div>
        
        <div className="flex-1 overflow-auto">
          <UserList 
            users={mockUsers} 
            selectedUser={selectedUser} 
            onSelectUser={handleSelectUser} 
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {showNotifications && (
          <div className="absolute top-16 right-4 z-10">
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </div>
        )}
        
        {selectedUser ? (
          <ChatBox selectedUser={selectedUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col p-4">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium">Select a conversation</h3>
            <p className="text-muted-foreground">Choose a user from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
