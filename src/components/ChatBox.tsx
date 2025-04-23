import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleDot, Smile, Send } from "lucide-react";
import { mockMessages } from "@/lib/mockData";
import MessageItem from "@/components/MessageItem";
import EmojiPicker from "@/components/EmojiPicker";
import { Message, User } from "@/types/chat";

interface ChatBoxProps {
  selectedUser: User;
}

const ChatBox = ({ selectedUser }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        senderId: "current-user", // This would be the actual userId in a real app
        text: newMessage,
        timestamp: new Date().toISOString(),
        status: "sent",
        reactions: []
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage("");
      
      // Simulate received message and read status for demo purposes
      setTimeout(() => {
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          const replyMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            senderId: selectedUser.id,
            text: "Thanks for your message!",
            timestamp: new Date().toISOString(),
            status: "sent",
            reactions: []
          };
          
          setMessages(prev => [...prev, replyMsg]);
          
          // Mark the message as read after a short delay
          setTimeout(() => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === newMsg.id ? { ...msg, status: "read" as const } : msg
              )
            );
          }, 1000);
        }, 2000);
      }, 1000);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === emoji && r.userId === "current-user");
        
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
              { userId: "current-user", emoji, timestamp: new Date().toISOString() }
            ]
          };
        }
      }
      return msg;
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
            <AvatarFallback>{selectedUser.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
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
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => (
          <MessageItem 
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === "current-user"}
            onAddReaction={(emoji) => handleAddReaction(message.id, emoji)}
          />
        ))}
        
        {isTyping && (
          <div className="flex items-center ml-2 mt-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback>{selectedUser.name.substring(0, 2)}</AvatarFallback>
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
