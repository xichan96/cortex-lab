import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { Button } from 'antd';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import Editor, { DiffEditor, OnMount, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useThemeStore } from '@/store';
import styles from './index.module.scss';
import { useI18n } from '@/hooks/useI18n';

export interface ActionButton {
  label: string;
  onClick: () => void;
  loading?: boolean;
  type?: 'default' | 'primary';
}

export interface CodeReferenceInfo {
  fileName: string;
  lineRange: string;
  content: string;
}

export interface EditorAreaRef {
  navigateToLine: (lineRange: string) => void;
  replaceCode: (content: string, lineRange?: string) => void;
  insertCode: (content: string) => void;
}

interface EditorAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  actions?: ActionButton[];
  showDiff?: boolean;
  originalContent?: string;
  modifiedContent?: string;
  hasPublished?: boolean;
  onAddToChat?: (content: string | CodeReferenceInfo) => void;
  onSave?: () => void;
  fileName?: string;
  language?: string;
}

const EditorArea = forwardRef<EditorAreaRef, EditorAreaProps>(({ 
  content, 
  onContentChange, 
  actions = [],
  showDiff = false,
  originalContent = '',
  modifiedContent = '',
  hasPublished = false,
  onAddToChat,
  onSave,
  fileName = 'editor',
  language = 'markdown'
}, ref) => {
  const { t } = useI18n();
  const { theme } = useThemeStore();
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<{ startLine: number; endLine: number } | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const navigateTimeoutsRef = useRef<{ focus?: NodeJS.Timeout; highlight?: NodeJS.Timeout }>({});

  const commonOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    tabSize: 2,
    renderWhitespace: 'selection' as const,
  }), []);

  const updateSelectedText = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const text = editor.getModel()?.getValueInRange(selection) || '';
      setSelectedText(text);
      
      const startLine = selection.startLineNumber;
      const endLine = selection.endLineNumber;
      setSelectedRange({ startLine, endLine });
      
      if (text.trim() && editorContainerRef.current) {
        const endPosition = selection.getEndPosition();
        const coords = editor.getScrolledVisiblePosition(endPosition);
        if (coords) {
          const editorContainer = editorContainerRef.current;
          const rect = editorContainer.getBoundingClientRect();
          const top = rect.top + coords.top + 20;
          const left = rect.left + coords.left;
          setButtonPosition({ top, left });
        }
      } else {
        setButtonPosition(null);
      }
    } else {
      setSelectedText('');
      setSelectedRange(null);
      setButtonPosition(null);
    }
  };

  const handleDiffEditorMount: DiffOnMount = (editor) => {
    diffEditorRef.current = editor;
    const modifiedEditor = editor.getModifiedEditor();
    
    // 确保 modified editor 是可编辑的
    modifiedEditor.updateOptions({ readOnly: false });
    
    modifiedEditor.onDidChangeModelContent(() => {
      const value = modifiedEditor.getValue();
      if (value !== content) {
        onContentChange(value);
      }
    });

    modifiedEditor.onDidChangeCursorSelection(() => {
      updateSelectedText(modifiedEditor);
    });

    modifiedEditor.onDidScrollChange(() => {
      if (selectedText.trim()) {
        updateSelectedText(modifiedEditor);
      }
    });

    if (onSave) {
      modifiedEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });
    }
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.updateOptions({ readOnly: false });
    
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      if (value !== content) {
        onContentChange(value);
      }
    });
    
    editor.onDidChangeCursorSelection(() => {
      updateSelectedText(editor);
    });

    editor.onDidScrollChange(() => {
      if (selectedText.trim()) {
        updateSelectedText(editor);
      }
    });
    
    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });
    }

    setTimeout(() => {
      editor.focus();
    }, 50);
  };

  const getActiveEditor = useCallback(() => {
    if (diffEditorRef.current) {
      return diffEditorRef.current.getModifiedEditor();
    }
    return editorRef.current;
  }, []);

  const navigateToLine = useCallback((lineRange: string) => {
    const editor = getActiveEditor();
    if (!editor) return;

    editor.updateOptions({ readOnly: false });

    const match = lineRange.match(/(\d+)(?:-(\d+))?/);
    if (!match) return;
    
    const parsedStart = parseInt(match[1], 10);
    const parsedEnd = match[2] ? parseInt(match[2], 10) : parsedStart;

    const model = editor.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();
    const startLine = Math.max(1, Math.min(parsedStart, lineCount));
    const endLine = Math.max(startLine, Math.min(parsedEnd, lineCount));

    editor.revealLineInCenter(startLine);

    editor.setSelection({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: endLine,
      endColumn: model.getLineLength(endLine) + 1,
    });

    const decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(startLine, 1, endLine, model.getLineLength(endLine) + 1),
        options: {
          className: styles.highlightedLine,
          isWholeLine: true,
        },
      },
    ]);

    if (navigateTimeoutsRef.current.focus) {
      clearTimeout(navigateTimeoutsRef.current.focus);
    }
    if (navigateTimeoutsRef.current.highlight) {
      clearTimeout(navigateTimeoutsRef.current.highlight);
    }

    if (editorContainerRef.current) {
      editorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    navigateTimeoutsRef.current.focus = setTimeout(() => {
      const currentEditor = getActiveEditor();
      if (!currentEditor) return;

      currentEditor.updateOptions({ readOnly: false });
      currentEditor.revealLineInCenter(startLine);
      
      currentEditor.setPosition({
        lineNumber: startLine,
        column: 1,
      });

      currentEditor.focus();
      
      navigateTimeoutsRef.current.focus = undefined;
    }, 100);

    navigateTimeoutsRef.current.highlight = setTimeout(() => {
      const currentEditor = getActiveEditor();
      if (currentEditor) {
        currentEditor.deltaDecorations(decorations, []);
      }
      navigateTimeoutsRef.current.highlight = undefined;
    }, 2000);
  }, [getActiveEditor]);

  const replaceCode = useCallback((content: string, lineRange?: string) => {
    const editor = getActiveEditor();
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    editor.updateOptions({ readOnly: false });

    let range: monaco.Range | null = null;

    if (lineRange) {
      const match = lineRange.match(/(\d+)(?:-(\d+))?/);
      if (match) {
        const parsedStart = parseInt(match[1], 10);
        const parsedEnd = match[2] ? parseInt(match[2], 10) : parsedStart;
        
        const lineCount = model.getLineCount();
        const startLine = Math.max(1, Math.min(parsedStart, lineCount));
        const endLine = Math.max(startLine, Math.min(parsedEnd, lineCount));
        
        range = new monaco.Range(
          startLine, 
          1, 
          endLine, 
          model.getLineLength(endLine) + 1
        );
      }
    }

    if (!range) {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        range = selection;
      } else {
        const lineCount = model.getLineCount();
        range = new monaco.Range(
          1, 
          1, 
          lineCount, 
          model.getLineLength(lineCount) + 1
        );
      }
    }

    editor.executeEdits('replace-code', [
      {
        range,
        text: content,
        forceMoveMarkers: true,
      },
    ]);
  }, [getActiveEditor]);

  const insertCode = useCallback((text: string) => {
    const editor = getActiveEditor();
    if (!editor) return;

    const selection = editor.getSelection();
    if (selection) {
      editor.executeEdits('insert-code', [
        {
          range: selection,
          text: text,
          forceMoveMarkers: true,
        },
      ]);
    } else {
      // If no selection, append to end or insert at cursor? 
      // getSelection usually returns cursor position if no range selected.
      // If truly no selection, append to end.
      const model = editor.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        const lastLineLength = model.getLineLength(lineCount);
        const range = new monaco.Range(lineCount, lastLineLength + 1, lineCount, lastLineLength + 1);
        editor.executeEdits('insert-code', [
          {
            range: range,
            text: text,
            forceMoveMarkers: true,
          },
        ]);
      }
    }
  }, [getActiveEditor]);

  useImperativeHandle(ref, () => ({
    navigateToLine,
    replaceCode,
    insertCode,
  }));

  const handleChatClick = () => {
    if (selectedText && onAddToChat) {
      onAddToChat({
        fileName,
        lineRange: selectedRange ? `${selectedRange.startLine}-${selectedRange.endLine}` : '',
        content: selectedText
      });
      setSelectedText('');
      setButtonPosition(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonPosition && editorContainerRef.current && !editorContainerRef.current.contains(event.target as Node)) {
        setButtonPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [buttonPosition]);

  return (
    <div className={styles.editorArea} ref={editorContainerRef}>
      <div className={styles.editorContainer}>
        {showDiff ? (
          <DiffEditor
            height="100%"
            language={language}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            original={originalContent}
            modified={modifiedContent}
            options={{
              ...commonOptions,
              readOnly: false,
              originalEditable: false,
              renderSideBySide: false,
            }}
            onMount={handleDiffEditorMount}
          />
        ) : (
          <Editor
            height="100%"
            language={language}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={content}
            onChange={(value) => onContentChange(value || '')}
            options={{
              ...commonOptions,
              readOnly: false,
            }}
            onMount={handleEditorMount}
          />
        )}
        {buttonPosition && (
          <div
            style={{
              position: 'fixed',
              top: buttonPosition.top,
              left: buttonPosition.left,
              zIndex: 1000,
            }}
          >
            <Button
              type="primary"
              size="small"
              icon={<ConsoleSqlOutlined />}
              onClick={handleChatClick}
              className={styles.chatButton}
            >
              {t('promptEditor.addToChat', '添加到聊天')}
            </Button>
          </div>
        )}
      </div>
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              loading={action.loading}
              type={action.type || 'default'}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});

EditorArea.displayName = 'EditorArea';

export default EditorArea;
