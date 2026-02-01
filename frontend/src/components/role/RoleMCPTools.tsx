import React, { useState } from 'react';
import { Plus, Cpu, ChevronRight, Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { Role } from '@/types/hub';
import { fetchMCPTools, MCPTool } from '@/apis/mcp';

interface RoleMCPToolsProps {
  toolConfig: Role['tool_config'];
  onChange: (toolConfig: Role['tool_config']) => void;
}

export function RoleMCPTools({ toolConfig, onChange }: RoleMCPToolsProps) {
  const { t } = useI18n();
  const [fetchingMCP, setFetchingMCP] = useState(false);
  const [fetchedMCPTools, setFetchedMCPTools] = useState<{url: string, tools: MCPTool[]} | null>(null);

  const handleAddMCP = () => {
    const current = toolConfig?.mcp || [];
    const next = current.concat([{ url: '', tools: [] }]);
    
    onChange({
      ...(toolConfig || {}),
      mcp: next,
    });
  };

  const handleUpdateMCPUrl = (index: number, url: string) => {
    const current = toolConfig?.mcp ? [...toolConfig.mcp] : [];
    if (!current[index]) {
      current[index] = { url: '', tools: [] };
    }
    current[index] = { ...current[index], url };
    
    onChange({
      ...(toolConfig || {}),
      mcp: current,
    });
  };

  const handleDeleteMCP = (index: number) => {
    const current = toolConfig?.mcp ? [...toolConfig.mcp] : [];
    current.splice(index, 1);
    
    onChange({
      ...(toolConfig || {}),
      mcp: current,
    });
  };

  const handleToggleTool = (mcpIndex: number, toolName: string, checked: boolean) => {
    const current = toolConfig?.mcp ? [...toolConfig.mcp] : [];
    if (!current[mcpIndex]) {
      current[mcpIndex] = { url: '', tools: [] };
    }
    const prevTools = current[mcpIndex].tools || [];
    const nextTools = checked
      ? Array.from(new Set(prevTools.concat([toolName])))
      : prevTools.filter(n => n !== toolName);
    current[mcpIndex] = { ...current[mcpIndex], tools: nextTools };
    
    onChange({
      ...(toolConfig || {}),
      mcp: current,
    });
  };

  const handleSelectAll = (mcpIndex: number, tools: MCPTool[]) => {
    const current = toolConfig?.mcp ? [...toolConfig.mcp] : [];
    if (!current[mcpIndex]) {
      current[mcpIndex] = { url: '', tools: [] };
    }
    current[mcpIndex] = { ...current[mcpIndex], tools: tools.map(t => t.name) };
    
    onChange({
      ...(toolConfig || {}),
      mcp: current,
    });
  };

  const handleClearAll = (mcpIndex: number) => {
    const current = toolConfig?.mcp ? [...toolConfig.mcp] : [];
    if (!current[mcpIndex]) {
      current[mcpIndex] = { url: '', tools: [] };
    }
    current[mcpIndex] = { ...current[mcpIndex], tools: [] };
    
    onChange({
      ...(toolConfig || {}),
      mcp: current,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} />
          <span className="text-sm font-medium text-[var(--text-color)]">
            {t('role.tools.mcp', 'MCP Tools')}
          </span>
        </div>
        <button
          onClick={handleAddMCP}
          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Plus size={14} />
          {t('role.tools.mcp.add', 'Add MCP Server')}
        </button>
      </div>

      <div className="space-y-3">
        {(toolConfig?.mcp || []).length === 0 && (
          <p className="text-[var(--text-color-secondary)] text-sm italic">
            {t('role.tools.mcp.empty', 'No MCP server configured yet.')}
          </p>
        )}
        {(toolConfig?.mcp || []).map((mcp, index) => (
          <div
            key={index}
            className="p-3 bg-[var(--body-bg)] rounded-lg border border-[var(--border-color)] space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={mcp.url}
                onChange={(e) => handleUpdateMCPUrl(index, e.target.value)}
                placeholder={t('role.tools.mcp.url.placeholder', 'MCP server URL, e.g. http://localhost:4000')}
                className="flex-1 px-3 py-1.5 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <button
                onClick={() => handleDeleteMCP(index)}
                className="text-xs text-[var(--text-color-secondary)] hover:text-red-500"
              >
                {t('common.delete', 'Delete')}
              </button>
            </div>

            <details 
              className="mt-2 group border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)]"
              onToggle={(e) => {
                if (e.currentTarget.open) {
                  if (mcp.url && (fetchedMCPTools?.url !== mcp.url)) {
                    setFetchingMCP(true);
                    fetchMCPTools(mcp.url)
                      .then(res => {
                        setFetchedMCPTools({ url: mcp.url, tools: res.tools });
                      })
                      .catch(err => console.error(err))
                      .finally(() => setFetchingMCP(false));
                  }
                }
              }}
            >
              <summary className="list-none flex items-center justify-between p-2 cursor-pointer select-none hover:bg-[var(--item-hover-bg)] transition-colors rounded-lg">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-color)]">
                  <span className="group-open:rotate-90 transition-transform">
                    <ChevronRight size={14} />
                  </span>
                  <span>
                    {t('role.tools.mcp.configure', 'Configure Tools')}
                    {mcp.tools && mcp.tools.length > 0 && (
                      <span className="ml-2 text-[var(--text-color-secondary)] font-normal">
                        ({mcp.tools.length} selected)
                      </span>
                    )}
                  </span>
                </div>
                
                {fetchedMCPTools && fetchedMCPTools.url === mcp.url && (
                  <div className="flex items-center gap-2">
                    <button
                      className="text-[10px] px-2 py-1 bg-[var(--card-bg)] rounded border border-[var(--border-color)] hover:bg-[var(--item-hover-bg)]"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectAll(index, fetchedMCPTools.tools);
                      }}
                    >
                      {t('common.selectAll', 'Select All')}
                    </button>
                    <button
                      className="text-[10px] px-2 py-1 bg-[var(--card-bg)] rounded border border-[var(--border-color)] hover:bg-[var(--item-hover-bg)]"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClearAll(index);
                      }}
                    >
                      {t('common.clear', 'Clear')}
                    </button>
                  </div>
                )}
              </summary>
              
              <div className="p-2 border-t border-[var(--border-color)]">
                {fetchingMCP && fetchedMCPTools?.url !== mcp.url ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2 text-[var(--text-color-secondary)]">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-xs">{t('role.tools.mcp.fetching', 'Fetching tools...')}</span>
                  </div>
                ) : !mcp.url ? (
                  <div className="py-4 text-center text-xs text-[var(--text-color-secondary)] italic">
                    {t('role.tools.mcp.enterUrl', 'Please enter MCP server URL first')}
                  </div>
                ) : (!fetchedMCPTools || fetchedMCPTools.url !== mcp.url) ? (
                  <div className="py-4 text-center text-xs text-[var(--text-color-secondary)]">
                    {t('role.tools.mcp.clickToFetch', 'Expand to load tools')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fetchedMCPTools.tools.map(toolItem => {
                      const checked = (mcp.tools || []).includes(toolItem.name);
                      return (
                        <label key={toolItem.name} className="flex items-start gap-2 text-xs bg-[var(--body-bg)] border border-[var(--border-color)] rounded px-2 py-2 cursor-pointer hover:bg-[var(--item-hover-bg)] transition-colors">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleToggleTool(index, toolItem.name, e.target.checked)}
                            className="mt-0.5 h-3 w-3 shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{toolItem.name}</span>
                            {toolItem.description && (
                              <span className="text-[var(--text-color-secondary)] line-clamp-2 text-[10px] mt-0.5" title={toolItem.description}>
                                {toolItem.description}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
