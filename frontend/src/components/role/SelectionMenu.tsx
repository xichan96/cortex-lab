import React from 'react';
import { MessageSquare } from 'lucide-react';

interface SelectionMenuProps {
  x: number;
  y: number;
  text: string;
  lineRange: string;
  source: string;
  onAddToChat: () => void;
}

export function SelectionMenu({ x, y, onAddToChat }: SelectionMenuProps) {
  return (
    <div 
      style={{ position: 'fixed', top: y, left: x, zIndex: 50 }}
      className="animate-in fade-in zoom-in duration-200"
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToChat();
        }}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        <MessageSquare size={14} />
        Add to Chat
      </button>
    </div>
  );
}
