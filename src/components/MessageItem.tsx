
import { useState, useRef } from "react";
import { format } from "date-fns";
import { Smile, Check, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmojiPicker from "@/components/EmojiPicker";
import { Message } from "@/types/chat";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  isSelected?: boolean;
  onAddReaction: (emoji: string) => void;
  onMarkAsRead?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
}

const MessageItem = ({ 
  message, 
  isCurrentUser, 
  isSelected = false,
  onAddReaction, 
  onMarkAsRead,
  onEdit,
  onDelete,
  onSelect
}: MessageItemProps) => {
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
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          ref={messageRef}
          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} relative ${isSelected ? "opacity-70" : ""}`}
          onClick={(e) => {
            if (e.shiftKey && onSelect) {
              onSelect();
            } else if (!isCurrentUser && onMarkAsRead) {
              onMarkAsRead();
            }
          }}
        >
          <div
            className={`max-w-[70%] relative group ${
              isCurrentUser 
                ? `bg-primary text-primary-foreground rounded-t-lg rounded-l-lg ${isSelected ? "ring-2 ring-blue-400" : ""}` 
                : `bg-white border rounded-t-lg rounded-r-lg ${isSelected ? "ring-2 ring-blue-400" : ""}`
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
            
            {/* Action buttons for current user's messages - Make them more visible */}
            {isCurrentUser && (
              <div className="absolute -right-24 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 w-6 bg-white hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit();
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 w-6 bg-white hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 w-6 bg-white hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactionPicker(!showReactionPicker);
                  }}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Reaction button for non-current user's messages */}
            {!isCurrentUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 absolute -right-7 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowReactionPicker(!showReactionPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            )}
            
            {/* Reaction picker */}
            {showReactionPicker && (
              <div className={`absolute z-10 top-1/2 -translate-y-1/2 mt-2 ${isCurrentUser ? "right-full mr-2" : "left-full ml-2"}`}>
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        {isCurrentUser && (
          <>
            <ContextMenuItem onClick={() => onEdit && onEdit()}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Message
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onDelete && onDelete()}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Message
            </ContextMenuItem>
          </>
        )}
        <ContextMenuItem onClick={() => onSelect && onSelect()}>
          {isSelected ? "Unselect Message" : "Select Message"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MessageItem;
