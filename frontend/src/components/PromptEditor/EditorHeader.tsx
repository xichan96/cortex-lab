import styles from './index.module.scss';

interface EditorHeaderProps {
  title: string;
  onClick?: () => void;
  versionIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  status?: string;
  center?: React.ReactNode;
}

export default function EditorHeader({ title, onClick, versionIcon, leftIcon, status, center }: EditorHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {leftIcon && <div className={styles.headerActions} style={{ marginRight: 8 }}>{leftIcon}</div>}
        <span 
          className={`${styles.title} ${onClick ? styles.clickable : ''}`} 
          onClick={onClick}
        >
          {title}
        </span>
        {status && <span className={styles.status}>{status}</span>}
      </div>
      {center && <div className={styles.headerCenter}>{center}</div>}
      {versionIcon && <div className={styles.headerActions}>{versionIcon}</div>}
    </div>
  );
}

