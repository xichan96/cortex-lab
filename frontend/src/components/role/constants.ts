export const AVATAR_STYLES = {
  NOTIONISTS: 'notionists',
  BOTTTS: 'bottts',
  ADVENTURER: 'adventurer',
  FUN_EMOJI: 'fun-emoji',
  BIG_SMILE: 'big-smile',
  MICAH: 'micah',
  AVATAAARS: 'avataaars',
};

export const BUILTIN_TOOLS = [
  { id: 'command', label: 'Command', description: 'Execute system shell commands' },
  { id: 'file', label: 'File', description: 'Read and write files on the local filesystem' },
  { id: 'math_calculate', label: 'Math Calculate', description: 'Perform complex mathematical calculations' },
  { id: 'net_check', label: 'Net Check', description: 'Diagnose network connectivity and DNS resolution' },
  { id: 'send_email', label: 'Send Email', description: 'Send emails via SMTP configuration' },
  { id: 'ssh', label: 'SSH', description: 'Execute commands on remote servers via SSH' },
  { id: 'get_time', label: 'Get Time', description: 'Get the current system time and date' },
];

// Generate a DiceBear URL
export const getDiceBearUrl = (seed: string, style = AVATAR_STYLES.NOTIONISTS) => 
  `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;

export const PRESET_AVATARS = [
  // Professional Roles
  { id: 'Engineer', style: AVATAR_STYLES.AVATAAARS }, // Engineer / Developer
  { id: 'Product', style: AVATAR_STYLES.MICAH },      // Product Manager
  { id: 'Architect', style: AVATAR_STYLES.NOTIONISTS }, // Architect
  { id: 'Designer', style: AVATAR_STYLES.MICAH },     // Designer
  { id: 'Tester', style: AVATAR_STYLES.BOTTTS },      // QA / Tester

  // Notion Style (Minimalist)
  { id: 'Felix', style: AVATAR_STYLES.NOTIONISTS },
  { id: 'Aneka', style: AVATAR_STYLES.NOTIONISTS },
  { id: 'Chase', style: AVATAR_STYLES.NOTIONISTS },
  { id: 'Dia', style: AVATAR_STYLES.NOTIONISTS },
  { id: 'Galen', style: AVATAR_STYLES.NOTIONISTS },
  
  // Adventurer (Fantasy & Colorful)
  { id: 'Alex', style: AVATAR_STYLES.ADVENTURER },
  { id: 'Willow', style: AVATAR_STYLES.ADVENTURER },
  { id: 'Leo', style: AVATAR_STYLES.ADVENTURER },
  { id: 'Sophie', style: AVATAR_STYLES.ADVENTURER },
  { id: 'Max', style: AVATAR_STYLES.ADVENTURER },

  // Big Smile (Cheerful & Bright)
  { id: 'Happy', style: AVATAR_STYLES.BIG_SMILE },
  { id: 'Joy', style: AVATAR_STYLES.BIG_SMILE },
  { id: 'Sunny', style: AVATAR_STYLES.BIG_SMILE },
  { id: 'Bright', style: AVATAR_STYLES.BIG_SMILE },
  { id: 'Cheer', style: AVATAR_STYLES.BIG_SMILE },

  // Micah (Artistic & Modern)
  { id: 'Art1', style: AVATAR_STYLES.MICAH },
  { id: 'Art2', style: AVATAR_STYLES.MICAH },
  { id: 'Art3', style: AVATAR_STYLES.MICAH },
  { id: 'Art4', style: AVATAR_STYLES.MICAH },
  { id: 'Art5', style: AVATAR_STYLES.MICAH },

  // Fun Emoji (Playful)
  { id: 'Fun1', style: AVATAR_STYLES.FUN_EMOJI },
  { id: 'Fun2', style: AVATAR_STYLES.FUN_EMOJI },
  { id: 'Fun3', style: AVATAR_STYLES.FUN_EMOJI },
  { id: 'Fun4', style: AVATAR_STYLES.FUN_EMOJI },
  { id: 'Fun5', style: AVATAR_STYLES.FUN_EMOJI },
  
  // Avataaars (Classic & Colorful)
  { id: 'Ava1', style: AVATAR_STYLES.AVATAAARS },
  { id: 'Ava2', style: AVATAR_STYLES.AVATAAARS },
  { id: 'Ava3', style: AVATAR_STYLES.AVATAAARS },
  { id: 'Ava4', style: AVATAR_STYLES.AVATAAARS },
  { id: 'Ava5', style: AVATAR_STYLES.AVATAAARS },

  // Robots (Tech)
  { id: 'Robo1', style: AVATAR_STYLES.BOTTTS },
  { id: 'Robo2', style: AVATAR_STYLES.BOTTTS },
  { id: 'Robo3', style: AVATAR_STYLES.BOTTTS },
  { id: 'Robo4', style: AVATAR_STYLES.BOTTTS },
  { id: 'Robo5', style: AVATAR_STYLES.BOTTTS },
];
