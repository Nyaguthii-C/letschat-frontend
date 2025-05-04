
import { useState, useRef } from "react";
import { format } from "date-fns";
import { Smile, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmojiPicker from "@/components/EmojiPicker";
import { Message } from "@/types/chat";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  onAddReaction: (emoji: string) => void;
  onMarkAsRead?: () => void;
}

const MessageItem = ({ message, isCurrentUser, onAddReaction, onMarkAsRead }: MessageItemProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const formattedTime = (() => {
    const date = new Date(message.timestamp);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, "MMM d, h:mm a");
  })();
  

  
  const handleAddReaction = (emoji: string) => {
    onAddReaction(emoji);
    setShowReactionPicker(false);
  };

  return (
    <div 
      ref={messageRef}
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} relative`}
      onClick={!isCurrentUser && onMarkAsRead ? onMarkAsRead : undefined}
    >
      <div
        className={`max-w-[70%] relative group ${
          isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-t-lg rounded-l-lg" 
            : "bg-white border rounded-t-lg rounded-r-lg"
        } px-4 py-2 shadow-sm`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div className={`flex items-center mt-1 text-xs ${isCurrentUser ? "text-primary-foreground/70" : "text-gray-500"}`}>
          <span>{formattedTime}</span>
          {isCurrentUser && (
            <span className="ml-1 flex items-center">
              {message.status === "read" ? (
                <Check className="h-3 w-3 ml-1 text-blue-400" />
              ) : (
                <Check className="h-3 w-3 ml-1" />
              )}
            </span>
          )}
        </div>
        
        {/* Reaction button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 absolute -right-7 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
        >
          <Smile className="h-4 w-4" />
        </Button>
        
        {/* Reaction picker */}
        {showReactionPicker && (
          <div className={`absolute z-10 ${isCurrentUser ? "right-0" : "left-0"} bottom-full mb-2`}>
            <EmojiPicker
              onSelect={handleAddReaction}
              onClickOutside={() => setShowReactionPicker(false)}
            />
          </div>
        )}
        
        {/* Reactions display */}
        {message.reactions.length > 0 && (
          <div className={`absolute ${isCurrentUser ? "-left-2" : "-right-2"} -bottom-2 flex`}>
            <div className="bg-white rounded-full border shadow-sm px-1 py-0.5 flex items-center">
              {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, i) => (
                <span key={i} className="cursor-pointer" onClick={() => onAddReaction(emoji.toString())}>
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

