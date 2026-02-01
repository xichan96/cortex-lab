import React from 'react';
import { AgentSettings } from './AgentSettings';
import { LLMSettings } from './LLMSettings';
import { MemorySettings } from './MemorySettings';

export const RoleEditorAgentSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <AgentSettings />
      <LLMSettings />
      <MemorySettings />
    </div>
  );
};
