export interface ExperienceItem {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'url' | 'file';
  tags: string[];
  updatedAt: string;
}

export interface EmailConfig {
  address: string;
  name: string;
  pwd: string;
  host: string;
  port: number;
}

export interface RoleNotification {
  target_role_ids: string[];
  trigger: string;
  content: string;
}

export interface HumanNotification {
  target_emails: string[];
  trigger: string;
  content: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  prompt: string;
  principle?: string;
  experience: ExperienceItem[];
  tools: string[];
  tool_config?: {
    builtin?: string[];
    mcp?: {
      url: string;
      tools?: string[];
    }[];
    email_config?: EmailConfig;
    role_notifications?: RoleNotification[];
    human_notifications?: HumanNotification[];
  };
  updatedAt: string;
}
