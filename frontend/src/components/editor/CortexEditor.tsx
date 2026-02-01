import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Save, X, MessageSquare } from 'lucide-react';

export interface CortexEditorRef {
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
  getContent: () => string;
}

interface CortexEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  onAddToChat?: (content: string, context?: { lineRange: string }) => void;
  className?: string;
}

export const CortexEditor = forwardRef<CortexEditorRef, CortexEditorProps>(({ 
  initialContent = '', 
  onSave, 
  onCancel,
  onAddToChat,
  className 
}, ref) => {
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing knowledge...',
      }),
    ],
    content: initialContent,
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none h-full min-h-[300px] dark:prose-invert',
        },
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onAddToChat) return;
      
      const { state, view } = editor;
      const { selection } = state;

      if (selection.empty) {
        setMenuPosition(null);
        return;
      }

      // Get the end position of the selection
      const { to } = selection;
      const coords = view.coordsAtPos(to);
      
      // Calculate position (slightly above the selection end)
      setMenuPosition({
        top: coords.top - 40,
        left: coords.left
      });
    },
    onBlur: () => {
      // Optional: hide menu on blur, but might interfere with clicking the button
      // setMenuPosition(null);
    }
  });

  // Hide menu when clicking outside or scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (menuPosition) setMenuPosition(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [menuPosition]);

  useImperativeHandle(ref, () => ({
    setContent: (content: string) => {
      editor?.commands.setContent(content);
    },
    insertContent: (content: string) => {
      editor?.commands.insertContent(content);
    },
    getContent: () => {
      return editor?.getHTML() || '';
    }
  }), [editor]);

  const handleSave = () => {
    if (editor && onSave) {
      onSave(editor.getHTML());
    }
  };

  const handleAddToChat = () => {
    if (editor && onAddToChat) {
      const selection = editor.state.selection;
      if (!selection.empty) {
        const text = editor.state.doc.textBetween(selection.from, selection.to, '\n');
        
        // Calculate line numbers
        const startLine = editor.state.doc.textBetween(0, selection.from, '\n').split('\n').length;
        const endLine = editor.state.doc.textBetween(0, selection.to, '\n').split('\n').length;
        const lineRange = startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
        
        onAddToChat(text, { lineRange });
        setMenuPosition(null);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden ${className || ''} relative`}>
      {/* Floating Menu */}
      {menuPosition && onAddToChat && (
        <div 
          style={{ 
            position: 'fixed', 
            top: menuPosition.top, 
            left: menuPosition.left,
            zIndex: 50 
          }}
          className="animate-in fade-in zoom-in duration-200"
        >
          <button
            onClick={handleAddToChat}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <MessageSquare size={14} />
            Add to Chat
          </button>
        </div>
      )}

      {/* Toolbar - Basic for now */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--header-bg)]">
        <div className="text-sm font-medium text-[var(--text-color-secondary)]">
          Editor
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-[var(--text-color-secondary)] hover:text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] rounded-lg transition-colors text-sm"
            >
              <X size={14} />
              Cancel
            </button>
          )}
          {onSave && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Save size={14} />
              Save
            </button>
          )}
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[var(--card-bg)] text-[var(--text-color)]">
         <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
});

CortexEditor.displayName = 'CortexEditor';
