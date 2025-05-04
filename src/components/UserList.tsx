
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleDot } from "lucide-react";
import { User } from "@/types/chat";

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

const UserList = ({ users, selectedUser, onSelectUser }: UserListProps) => {
  return (
    <div className="space-y-1 py-2">
      <h3 className="px-4 text-sm font-medium text-gray-500 mb-2">Conversations</h3>
      {users.map((user) => (
        <button
          key={user.id}
          className={`flex items-center w-full px-4 py-2 hover:bg-gray-50 transition-colors ${
            selectedUser?.id === user.id ? "bg-gray-100" : ""
          }`}
          onClick={() => onSelectUser(user)}
        >
          <div className="relative">
            <Avatar>
              <AvatarImage src={user.profile_photo} alt={user.full_name} />
              <AvatarFallback>{user.full_name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            {user.status === "online" && (
              <div className="absolute bottom-0 right-0 rounded-full bg-green-500 h-2.5 w-2.5 ring-2 ring-white" />
            )}
          </div>
          
          <div className="ml-3 text-left flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{user.full_name}</p>
              {user.unreadCount && user.unreadCount > 0 ? (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {user.unreadCount}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {user.lastMessage || (user.status === "online" ? "Online" : `Last seen ${user.lastSeen}`)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default UserList;
