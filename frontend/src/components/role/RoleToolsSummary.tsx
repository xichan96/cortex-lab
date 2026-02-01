import React from 'react';
import { useI18n } from '@/hooks/useI18n';

interface RoleToolsSummaryProps {
  tools: string[];
}

export function RoleToolsSummary({ tools }: RoleToolsSummaryProps) {
  const { t } = useI18n();

  return (
    <div className="pt-3 border-t border-dashed border-[var(--border-color)]">
      <h3 className="text-sm font-medium text-[var(--text-color)] mb-3 flex items-center gap-2">
        {t('role.tools.summary', 'Enabled Tools List')}
        <span className="text-xs font-normal text-[var(--text-color-secondary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
          {tools?.length || 0}
        </span>
      </h3>
      {tools && tools.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[var(--item-hover-bg)] rounded text-xs text-[var(--text-color)] border border-[var(--border-color)]"
            >
              {tool}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[var(--text-color-secondary)] text-sm italic">
          {t('role.tools.empty', 'No tools connected.')}
        </p>
      )}
    </div>
  );
}
