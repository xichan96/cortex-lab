import { useEffect, useState, useRef } from 'react';
import styles from './index.module.scss';
import { VersionType, VersionItem } from './types';
import { getPromptList, Prompt } from '@/apis/prompt';
import { useI18n } from '@/hooks/useI18n';

interface VersionListProps {
  selectedVersion: VersionType;
  onVersionChange: (version: VersionType, promptId?: string) => void;
  skillId: string;
  promptName?: string;
  currentPromptId?: string;
  selectedHistoryId?: string;
  refreshTrigger?: number;
}

export default function VersionList({ 
  selectedVersion, 
  onVersionChange, 
  skillId,
  promptName,
  currentPromptId,
  selectedHistoryId,
  refreshTrigger
}: VersionListProps) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchKeyRef = useRef<string>('');
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!skillId || !promptName) {
      setVersions([]);
      return;
    }
    
    const fetchKey = `${skillId}|${promptName}|${refreshTrigger ?? 0}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    const fetchVersions = async () => {
      try {
        setLoading(true);
        const prompts = await getPromptList(skillId, { name: promptName, status: 'archived' });
        
        const versionItems: VersionItem[] = [];
        
        const archivedPrompts = prompts.filter(p => p.status === 'archived').sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        archivedPrompts.forEach((prompt) => {
          versionItems.push({
            id: prompt.id,
            type: 'history',
            label: '',
            updatedAt: prompt.updated_at
          });
        });

        setVersions(versionItems);
      } catch (error) {
        setVersions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [skillId, promptName, refreshTrigger]);

  const handleVersionClick = (version: VersionItem) => {
    if (version.type === 'history' && selectedVersion === 'history' && version.id === selectedHistoryId) {
      return;
    }
    if (version.type === 'diff') {
      onVersionChange('diff', version.id);
    } else if (version.type === 'edit') {
      onVersionChange('edit', version.id);
    } else if (version.type === 'current') {
      onVersionChange('current', version.id);
    } else {
      onVersionChange('history', version.id);
    }
  };

  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.versionList}>
          <div className={styles.versionItem}>{t('common.loading', '加载中...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.versionList}>
        {versions.length === 0 ? (
          <div className={styles.versionItem}>{t('promptEditor.noVersion', '暂无版本')}</div>
        ) : (
          versions.map((version) => {
            const isActive = selectedVersion === 'history' && version.type === 'history' && version.id === selectedHistoryId;
            
            const formatDate = (dateString?: string) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              const now = new Date();
              const diff = now.getTime() - date.getTime();
              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              
              if (days === 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                if (hours === 0) {
                  const minutes = Math.floor(diff / (1000 * 60));
                  return minutes <= 0
                    ? t('time.justNow', '刚刚')
                    : `${minutes}${t('time.minutesAgo', '分钟前')}`;
                }
                return locale === 'en'
                  ? `${hours} ${t('time.hoursAgo', 'hours ago')}`
                  : `${hours}${t('time.hoursAgo', '小时前')}`;
              } else if (days < 7) {
                return locale === 'en'
                  ? `${days} ${t('time.daysAgo', 'days ago')}`
                  : `${days}${t('time.daysAgo', '天前')}`;
              } else {
                const lang = locale === 'en' ? 'en-US' : 'zh-CN';
                return date.toLocaleDateString(lang, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            };
            
            return (
              <div
                key={version.id}
                className={`${styles.versionItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleVersionClick(version)}
              >
                {version.label && (
                  <div className={styles.versionLabel}>{version.label}</div>
                )}
                {version.updatedAt && (
                  <div className={styles.versionTime}>{formatDate(version.updatedAt)}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
