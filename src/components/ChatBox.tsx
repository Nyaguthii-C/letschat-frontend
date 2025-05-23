import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleDot, Smile, Send, X, Trash2 } from "lucide-react";
import MessageItem from "@/components/MessageItem";
import EmojiPicker from "@/components/EmojiPicker";
import { Message, User } from "@/types/chat";
import api from "@/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BASE_URL_IP } from '@/api';


interface ChatBoxProps {
  selectedUser: User;
  conversationId: string;
  setConversationId: (id: string) => void;
}

const ChatBox = ({ selectedUser, conversationId, setConversationId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // selection and delete functionality
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMultiDeleteDialog, setShowMultiDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
  
  useEffect(() => {
    // Always clear messages when selectedUser changes
    setMessages([]);
    setSelectedMessages(new Set());
  
    // Only fetch if there's an actual conversation ID
    if (conversationId) {
      fetchMessages();
    }
  }, [selectedUser.id, conversationId]);
  
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const token = localStorage.getItem("access_token");
  
      try {
        // handle new message sending
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
  
  const handleDeleteMessage = async () => {
    console.log("Delete function called");
    if (!messageToDelete || !messageToDelete.id) {
      console.warn("No message provided to delete.");
      return;
    }
    console.log('Message to be deleted:', messageToDelete);
    
    const token = localStorage.getItem("access_token");
    try {
      await api.delete(`messages/${messageToDelete.id}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },        
      });
      
      // Remove message locally
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageToDelete.id)
      );
      
      setMessageToDelete(null);
      setShowDeleteDialog(false);
      
      // re-fetch from the server after delete
      await fetchMessages();
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };
  
  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    
    const token = localStorage.getItem("access_token");
    
    try {
      // Process each selected message
      const deletePromises = Array.from(selectedMessages).map(messageId => 
        api.delete(`messages/${messageId}/delete/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      
      await Promise.all(deletePromises);
      
      // Remove selected messages locally
      setMessages(prevMessages => 
        prevMessages.filter(msg => !selectedMessages.has(msg.id))
      );
      
      setSelectedMessages(new Set());
      setShowMultiDeleteDialog(false);
      
      // Re-fetch from the server after delete
      await fetchMessages();
    } catch (err) {
      console.error("Failed to delete selected messages:", err);
    }
  };
  
  const handleAddReaction = async (messageId: string, emoji: string) => {
    const token = localStorage.getItem("access_token");
  
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReactionIndex = msg.reactions.findIndex(
            r => r.emoji === emoji && r.userId === currentUser.id
          );
  
          if (existingReactionIndex >= 0) {
            // Remove reaction from local state
            const updatedReactions = [...msg.reactions];
            updatedReactions.splice(existingReactionIndex, 1);
  
            // Persist remove to backend
            api.post(
              `messages/${messageId}/remove-reaction/`,
              { emoji },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ).catch(err => {
              console.error("Failed to remove reaction:", err);
            });
  
            return { ...msg, reactions: updatedReactions };
          } else {
            // Add reaction locally
            const newReactions = [
              ...msg.reactions,
              {
                userId: currentUser.id,
                emoji,
                timestamp: new Date().toISOString(),
              },
            ];
  
            // Persist add to backend
            api.post(
              `messages/${messageId}/react/`,
              { emoji },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ).catch(err => {
              console.error("Failed to add reaction:", err);
            });
  
            return { ...msg, reactions: newReactions };
          }
        }
        return msg;
      })
    );
  };
  
  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: "read" as const } : msg
      )
    );
  };
  
  const handleToggleSelect = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };
  
  const toggleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      // If all are selected, deselect all
      setSelectedMessages(new Set());
    } else {
      // Otherwise, select all
      setSelectedMessages(new Set(messages.map(msg => msg.id)));
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const socket = new WebSocket(`ws://${BASE_URL_IP}/ws/notifications/?token=${token}`);

    socket.onopen = () => {
      console.log("WebSocket connected for messages");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        const senderId = data.sender;

        // Only refetch if the message is from the current conversation
        if (senderId === selectedUser.id) {
          fetchMessages();
        }
        console.log('sender id for new message', senderId)
        console.log('the data from new_message', data)
      }
      if (data.type === 'reaction'){
        if(selectedUser.id === data.reactor_data.id){
        // refetch messages to load new reactions
          fetchMessages();
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected for messages");
    };

    return () => {
      socket.close();
    };
  }, [selectedUser.id, conversationId]);




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
        
        {/* Selection controls */}
        {selectedMessages.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm">{selectedMessages.size} selected</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedMessages(new Set())}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowMultiDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedMessages.size === messages.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        )}
      </div>
      

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((message, index) => (
            <MessageItem 
              key={`${message.id}-${index}`}
              message={message}
              isCurrentUser={message.senderId === currentUser.id}
              isSelected={selectedMessages.has(message.id)}
              onAddReaction={(emoji) => handleAddReaction(message.id, emoji)}
              onMarkAsRead={() => handleMarkMessageAsRead(message.id)}
              onDelete={() => {
                setMessageToDelete(message);
                setShowDeleteDialog(true);
              }}
              onSelect={() => handleToggleSelect(message.id)}
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
        <div ref={messagesEndRef} />
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
            ref={inputRef}
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

      {/* Delete Single Message Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Multiple Messages Confirmation */}
      <AlertDialog open={showMultiDeleteDialog} onOpenChange={setShowMultiDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelectedMessages}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatBox;