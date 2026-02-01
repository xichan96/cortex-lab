import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useThemeStore } from '@/store';
import styles from './index.module.scss';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

export interface ExperienceEditorRef {
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
  getContent: () => string;
}

interface ExperienceEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  showPreview?: boolean;
}

export const ExperienceEditor = forwardRef<ExperienceEditorRef, ExperienceEditorProps>(({
  value,
  onChange,
  readOnly = false,
  showPreview = true,
}, ref) => {
  const { theme } = useThemeStore();
  const editorInstanceRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorInstanceRef.current = editor;
  };

  useImperativeHandle(ref, () => ({
    setContent: (content: string) => {
      onChange(content);
    },
    insertContent: (text: string) => {
      const editor = editorInstanceRef.current;
      if (editor) {
        const selection = editor.getSelection();
        const id = { major: 1, minor: 1 };
        const op = { 
          range: selection, 
          text: text, 
          forceMoveMarkers: true 
        };
        editor.executeEdits("my-source", [op]);
        // executeEdits doesn't automatically trigger model content change event in a way that updates the controlled value immediately in some setups,
        // but typically the onChange prop of Editor component catches it.
        // If not, we might need to manually call onChange(editor.getValue());
        // Let's rely on Editor's onChange for now.
      } else {
        onChange(value + text);
      }
    },
    getContent: () => value
  }));

  return (
    <div className={styles.container}>
      <div className={styles.editorContainer}>
        <div className={styles.editorPane} style={{ borderRight: showPreview ? undefined : 'none' }}>
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={value}
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorDidMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              readOnly,
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        {showPreview && (
          <div className={styles.previewPane}>
            <div className={styles.previewContent}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
              >
                {value}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ExperienceEditor;
