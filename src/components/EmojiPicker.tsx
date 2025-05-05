
import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { commonEmojis } from "@/lib/mockData";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClickOutside: () => void;
}

const EmojiPicker = ({ onSelect, onClickOutside }: EmojiPickerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  return (
    <Card ref={ref} className="w-64 h-40 mt-4 overflow-auto p-2 grid grid-cols-8 gap-1">
      {commonEmojis.map((emoji, index) => (
        <button
          key={index}
          className="flex items-center justify-center h-8 w-8 text-lg hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </Card>
  );
};

export default EmojiPicker;
