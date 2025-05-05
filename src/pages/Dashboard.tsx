import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, MessageSquare } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import UserList from "@/components/UserList";
import NotificationCenter from "@/components/NotificationCenter";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "@/types/chat";
import { fetchUsers } from "@/lib/userService";
import { getConversationWithUser } from "@/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {

    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    }

    const loadUsers = async () => {
      try {
        const fetched = await fetchUsers();
        const mappedUsers = fetched.map((u: any) => ({
          id: u.id,
          full_name: u.full_name,
          profile_photo: u.profile_photo,
          status: "online", // optional default
          email: u.email,
        }));

        setUsers(mappedUsers);

        if (mappedUsers.length > 0) {
          setSelectedUser(mappedUsers[0]);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    loadUsers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSelectUser = async (user: UserType) => {
    setSelectedUser(user);
    const conversationId = await getConversationWithUser(user.email);
    setConversationId(conversationId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Display logged-in user avatar and name */}
            {currentUser ? (
              <>
                <Avatar>
                  <AvatarImage src={currentUser.profile_photo || "/placeholder.svg"} alt={currentUser.full_name} />
                  <AvatarFallback>{currentUser.full_name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{currentUser.full_name}</h2>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </>
            ) : (
              <div>Loading...</div> // Handle loading state if currentUser is not available
            )}
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
            users={users}
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
          <ChatBox selectedUser={selectedUser} conversationId={conversationId} setConversationId={setConversationId} />
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
