import React from 'react';
import { User } from 'lucide-react';
import { PRESET_AVATARS, getDiceBearUrl } from './constants';
import clsx from 'clsx';

interface AvatarProps {
  avatar?: string;
  name?: string;
  size?: number;
  className?: string;
  fallbackIcon?: React.ElementType;
}

export function Avatar({ 
  avatar, 
  name, 
  size = 24, 
  className,
  fallbackIcon: FallbackIcon = User
}: AvatarProps) {
  // Check if avatar is a URL
  const isUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');
  
  // Check if avatar is a preset ID
  const preset = !isUrl ? PRESET_AVATARS.find(p => p.id === avatar) : null;
  
  // If it's a preset, generate the URL
  const avatarUrl = isUrl ? avatar : (preset ? getDiceBearUrl(preset.id, preset.style) : null);
  
  // Special case: if it's 'bot' or 'user' (legacy), map them to something reasonable
  const legacyMap: Record<string, string> = {
    'bot': getDiceBearUrl('Robo1', 'bottts'),
    'user': getDiceBearUrl('Felix', 'notionists'),
  };

  const finalUrl = avatarUrl || (avatar && legacyMap[avatar]);

  if (finalUrl) {
    return (
      <div 
        className={clsx("rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border border-[var(--border-color)]", className)}
        style={{ width: size, height: size }}
      >
        <img 
          src={finalUrl} 
          alt={name || 'Avatar'} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback
  return (
    <div 
      className={clsx(
        "rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center flex-shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <FallbackIcon size={size * 0.6} />
    </div>
  );
}
