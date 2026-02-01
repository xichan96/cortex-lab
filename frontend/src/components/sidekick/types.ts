export interface CodeReferenceInfo {
  fileName: string;
  lineRange: string;
  content: string;
}

export interface AISidekickProps {
  editorRef?: React.RefObject<{ 
    setContent: (content: string) => void;
    insertContent: (content: string) => void;
  }>;
  collapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
  chatId?: string;
  promptKey?: string;
}

export interface AISidekickRef {
  setInputMessage: (content: string | CodeReferenceInfo) => void;
}
