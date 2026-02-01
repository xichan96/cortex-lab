import React, { useState, useRef, useEffect } from 'react';
import { PRESET_AVATARS } from './constants';
import { Avatar } from './Avatar';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface AvatarSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  size?: number;
  className?: string;
}

export function AvatarSelector({ value, onChange, size = 48, className }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative rounded-full ring-2 ring-transparent hover:ring-indigo-500 transition-all focus:outline-none"
      >
        <Avatar avatar={value} size={size} className="shadow-sm" />
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 border border-[var(--border-color)] shadow-sm text-[var(--text-color-secondary)]">
          <ChevronDown size={12} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 w-80 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-5 gap-2">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChange(preset.id);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex items-center justify-center p-1.5 rounded-lg transition-all hover:scale-110",
                    value === preset.id ? "bg-[var(--item-hover-bg)] ring-2 ring-indigo-500" : "hover:bg-[var(--item-hover-bg)]"
                  )}
                  title={preset.id}
                >
                  <Avatar avatar={preset.id} size={32} />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
             <input 
               type="text" 
               placeholder="Or paste image URL..." 
               className="w-full px-2 py-1 text-xs bg-[var(--body-bg)] border border-[var(--border-color)] rounded text-[var(--text-color)] focus:border-indigo-500 outline-none"
               value={value && (value.startsWith('http') || value.startsWith('data:')) ? value : ''}
               onChange={(e) => onChange(e.target.value)}
             />
          </div>
        </div>
      )}
    </div>
  );
}
