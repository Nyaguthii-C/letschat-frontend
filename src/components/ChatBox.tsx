import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleDot, Smile, Send } from "lucide-react";
import { mockMessages } from "@/lib/mockData";
import MessageItem from "@/components/MessageItem";
import EmojiPicker from "@/components/EmojiPicker";
import { Message, User } from "@/types/chat";
import api from "@/api";

interface ChatBoxProps {
  selectedUser: User;
  conversationId: string;
  setConversationId: (id: string) => void;
}

const ChatBox = ({ selectedUser, conversationId, setConversationId }: ChatBoxProps) => {
  // const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  const fetchMessages = async () => {
    if (!conversationId) return; 

    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem("access_token");
  
      const res = await api.get(`conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setMessages(
        res.data.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender,
          text: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          status: msg.is_read ? "read" : "sent",
          reactions: msg.reactions || [],
        }))
      );
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };
    



  const fetchMessagesWithId = async (id: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem("access_token");
      const res = await api.get(`conversations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setMessages(
        res.data.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender,
          text: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          status: msg.is_read ? "read" : "sent",
          reactions: msg.reactions || [],
        }))
      );
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  




  // useEffect(() => {
  //   fetchMessages();
  // }, [conversationId]);
  
  // useEffect(() => {
  //   if (conversationId) {
  //     fetchMessages();
  //   }
  // }, [conversationId]);


  useEffect(() => {
    // Always clear messages when selectedUser changes
    setMessages([]);
  
    // Only fetch if there's an actual conversation ID
    if (conversationId) {
      fetchMessages();
    }
  }, [selectedUser.id, conversationId]);
  





  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const token = localStorage.getItem("access_token");
  
      try {
        const res = await api.post(
          "messages/send/",
          {
            receiver: selectedUser.id,
            content: newMessage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("New message added:", newMessage);

  
        const newMsg: Message = {
          id: res.data.id,
          senderId: res.data.sender_id,
          text: res.data.content,
          timestamp: res.data.timestamp,
          status: "sent",
          reactions: [],
        };

        if (!conversationId) {
          const newConversationId = res.data.data.conversation;
          setConversationId(newConversationId);
          await fetchMessagesWithId(newConversationId);
        } else {
          await fetchMessages(); // use existing ID
        }
        


        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");

        // Immediately re-fetch messages from backend
        await fetchMessages();

      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };
  

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === emoji && r.userId === currentUser.id);
        
        if (existingReactionIndex >= 0) {
          // Remove the reaction if it already exists
          const updatedReactions = [...msg.reactions];
          updatedReactions.splice(existingReactionIndex, 1);
          return { ...msg, reactions: updatedReactions };
        } else {
          // Add the new reaction
          return {
            ...msg,
            reactions: [
              ...msg.reactions,
              { userId: currentUser.id, emoji, timestamp: new Date().toISOString() }
            ]
          };
        }
      }
      return msg;
    }));
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: "read" as const } : msg
      )
    );
  };



  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={selectedUser.profile_photo} alt={selectedUser.full_name} />
            <AvatarFallback>{selectedUser.full_name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{selectedUser.full_name}</h3>
            <div className="flex items-center">
              {selectedUser.status === "online" ? (
                <>
                  <CircleDot className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Last seen {selectedUser.lastSeen}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map(message => (

            <MessageItem 
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUser.id}
              onAddReaction={(emoji) => handleAddReaction(message.id, emoji)}
              onMarkAsRead={() => handleMarkMessageAsRead(message.id)}
            />
          ))
        )}

        {isTyping && (
          <div className="flex items-center ml-2 mt-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={selectedUser.profile_photo} />
              <AvatarFallback>{selectedUser.full_name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="bg-gray-200 px-4 py-2 rounded-lg inline-block">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>




      {/* Input area */}
      <div className="p-4 border-t bg-white relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4">
            <EmojiPicker 
              onSelect={(emoji) => {
                setNewMessage(prev => prev + emoji);
                setShowEmojiPicker(false);
              }}
              onClickOutside={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <Button 
            type="button" 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
