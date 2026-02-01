import { CloseOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

interface CodeReferenceProps {
  fileName: string;
  lineRange: string;
  content?: string;
  onClose?: () => void;
  onNavigate?: (lineRange: string) => void;
}

export default function CodeReference({ fileName, lineRange, content, onClose, onNavigate }: CodeReferenceProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(lineRange);
    }
  };

  return (
    <div 
      className={styles.codeReference}
      onClick={handleClick}
      style={{ cursor: onNavigate ? 'pointer' : 'default' }}
    >
      {onClose && (
        <button
          className={styles.codeReferenceClose}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="关闭"
        >
          <CloseOutlined />
        </button>
      )}
      <span className={styles.codeReferenceFileName}>{fileName}</span>
      <span className={styles.codeReferenceRange}>({lineRange})</span>
      {content && (
        <div className={styles.codeReferenceContent}>
          <pre>
            <code>{content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

