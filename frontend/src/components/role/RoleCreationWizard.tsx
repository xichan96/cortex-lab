import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ChevronRight, Check, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { agentChat } from '@/apis/agent';
import { Role } from '@/types/hub';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

interface RoleCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (roleData: Partial<Role>) => Promise<void>;
}

type Step = 'input' | 'generating' | 'review';

export function RoleCreationWizard({ isOpen, onClose, onConfirm }: RoleCreationWizardProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('input');
  const [roleName, setRoleName] = useState('');
  const [generatedData, setGeneratedData] = useState<Partial<Role>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef(false);
  const sessionIdRef = useRef<string>('');
  const [chatInput, setChatInput] = useState('');
  const [isManual, setIsManual] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setRoleName('');
      setGeneratedData({});
      setError(null);
      setChatMessages([]);
      sessionIdRef.current = uuidv4();
      setChatInput('');
      setIsManual(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'generating' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, step]);

  const doAgentChat = async (userContent: string) => {
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;
      console.log('[RoleWizard] Starting agent chat...');
      try {
        const res = await agentChat({
          message: userContent,
          session_id: sessionIdRef.current,
          prompt_key: 'role_assistant',
          model: 'gpt-4o'
        });
  
        // Handle both standard OpenAI format and AgentExecutor output
        let content = '';
        if (res.choices && res.choices.length > 0 && res.choices[0]?.message?.content) {
             content = res.choices[0].message.content;
        } else if (res.output) {
             content = res.output;
        }

        if (!content) {
            console.warn('[RoleWizard] Empty content received', res);
            // If response is successful but empty content, maybe it's just intermediate steps?
            // But we shouldn't error out if we can avoid it.
        }
        
        // Add AI message
        setChatMessages(prev => [...prev, { role: 'assistant', content }]);
  
        // Parse the response
        // Look for ```prompt ... ``` block
        const promptBlockRegex = /```prompt\s*([\s\S]*?)\s*```/;
        const match = content.match(promptBlockRegex);
        
        let data;
        if (match && match[1]) {
          try {
            // Try to parse JSON from the block
            data = JSON.parse(match[1]);
          } catch (e) {
            console.error("Failed to parse JSON from prompt block", e);
          }
        }
  
        // Fallback: try to find any JSON block
        if (!data) {
          const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
          const jsonMatch = content.match(jsonBlockRegex);
          if (jsonMatch && jsonMatch[1]) {
             try { data = JSON.parse(jsonMatch[1]); } catch(e) {}
          }
        }
  
        // If still no data, try to parse the whole content as JSON (rare)
        if (!data) {
           try { data = JSON.parse(content); } catch(e) {}
        }

        // Final fallback: check if content looks like JSON object (even with some noise)
        if (!data) {
             const firstBrace = content.indexOf('{');
             const lastBrace = content.lastIndexOf('}');
             if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                 try {
                     data = JSON.parse(content.substring(firstBrace, lastBrace + 1));
                 } catch(e) {}
             }
        }
  
        if (data) {
          if (data.name) {
              setRoleName(data.name);
          }
          const finalRoleData = {
              name: data.name || roleName,
              description: data.description || '',
              prompt: data.prompt || '',
              principle: data.principle || '',
              avatar: data.avatar || '🤖',
              tools: [],
          };
          setGeneratedData(finalRoleData);

          // Auto-create directly (skip review step)
          setIsSubmitting(true);
          try {
              // Small delay to allow state updates and UI render
              await new Promise(resolve => setTimeout(resolve, 500));
              await onConfirm(finalRoleData);
              onClose();
          } catch (e) {
              console.error("Auto-create failed", e);
              setError(t('role.wizard.error.create_failed', 'Failed to create role.'));
              setStep('review'); // Fallback to review on error
          } finally {
              setIsSubmitting(false);
          }
        }
        // If no data found, we assume it's a conversation turn (clarifying questions)
        // so we don't set an error, just let the user reply.

      } catch (err) {
        console.error(err);
        setError(t('role.wizard.error.generation_failed', 'Failed to generate role. Please try again.'));
        setChatMessages(prev => [...prev, { role: 'assistant', content: t('role.wizard.error.generation_failed', 'Sorry, I encountered an error while designing the role. Please try again.') }]);
      } finally {
        isGeneratingRef.current = false;
      }
  };

  useEffect(() => {
    // Check if we need to trigger generation
    console.log('[RoleWizard] Checking trigger:', { step, msgCount: chatMessages.length });
    
    if (step === 'generating' && chatMessages.length === 1 && chatMessages[0].role === 'user') {
        const userContent = chatMessages[0].content;
        doAgentChat(userContent);
    }
  }, [step, chatMessages]);

  const handleGenerate = async () => {
    if (!roleName.trim()) return;

    setIsManual(false);
    setStep('generating');
    setError(null);
    
    // Add user message immediately
    const initialPromptTemplate = t('role.wizard.generating.initial_prompt', 'I want to create a role named "{{name}}". Please design it for me.');
    const userContent = initialPromptTemplate.replace('{{name}}', roleName);
    const userMsg = { role: 'user' as const, content: userContent };
    setChatMessages([userMsg]);
  };

  const handleManualCreate = () => {
    setIsManual(true);
    setGeneratedData({
      name: roleName,
      description: '',
      prompt: '',
      principle: '',
      avatar: '👤',
      tools: [],
    });
    setStep('review');
  };

  const handleSendReply = async () => {
      if (!chatInput.trim() || isGeneratingRef.current) return;
      
      const content = chatInput.trim();
      setChatInput('');
      setChatMessages(prev => [...prev, { role: 'user', content }]);
      
      await doAgentChat(content);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        ...generatedData,
        name: roleName, // Ensure name is current
      });
      onClose();
    } catch (err) {
      setError(t('role.wizard.error.create_failed', 'Failed to create role.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--header-bg)]">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-[var(--text-color)]">
              {t('role.wizard.title', 'Create AI Role')}
            </h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-color-secondary)] hover:text-[var(--text-color)]">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

          {step === 'input' && (
            <div className="space-y-8 relative z-10">
              <div className="text-center space-y-3 py-4">
                <h3 className="text-3xl font-bold text-[var(--text-color)] tracking-tight">
                  {t('role.wizard.input.title', 'What role do you want to create?')}
                </h3>
                <p className="text-lg text-[var(--text-color-secondary)] max-w-lg mx-auto leading-relaxed">
                  {t('role.wizard.input.subtitle', 'Enter a name, and AI will design the rest for you.')}
                </p>
              </div>
              
              <div className="max-w-xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
                  <div className="relative bg-[var(--card-bg)] rounded-xl p-1">
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Golang Expert, UI Designer, Storyteller..."
                      className="w-full pl-6 pr-36 py-4 text-xl bg-[var(--body-bg)] rounded-lg outline-none text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)]/50 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      autoFocus
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={!roleName.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
                    >
                      {t('common.next', 'Next')}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center animate-in fade-in slide-in-from-top-1">{error}</p>}
                
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {['Python Expert', 'Product Manager', 'Creative Writer', 'Data Analyst'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setRoleName(suggestion)}
                      className="px-3 py-1.5 text-sm text-[var(--text-color-secondary)] bg-[var(--item-hover-bg)] hover:bg-[var(--border-color)] rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleManualCreate}
                        className="text-sm text-[var(--text-color-secondary)] hover:text-indigo-500 transition-colors border-b border-transparent hover:border-indigo-500 pb-0.5"
                    >
                        {t('role.wizard.manual_create', 'Create Manually')}
                    </button>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col h-full relative">
              {isSubmitting && (
                  <div className="absolute inset-0 z-50 bg-[var(--card-bg)]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                      <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                      <h3 className="text-xl font-semibold text-[var(--text-color)]">{t('role.wizard.creating', 'Creating your role...')}</h3>
                  </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0">
                        <Avatar 
                          icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                          className={msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}
                          size={32}
                        />
                    </div>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] rounded-tl-sm'
                    }`}>
                        {msg.role === 'user' ? (
                            msg.content
                        ) : (
                            <div className="markdown-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
                {/* Loading Indicator */}
                {chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user' && (
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <Avatar icon={<RobotOutlined />} className="bg-emerald-600" size={32} />
                        </div>
                        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm flex items-center gap-2">
                            <Loader2 className="animate-spin text-indigo-500" size={16} />
                            <span className="text-[var(--text-color-secondary)] text-sm">{t('role.wizard.generating.subtitle', 'Crafting role...')}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area - Removed for one-shot flow */}
              {/* <div className="p-4 border-t border-[var(--border-color)] bg-[var(--card-bg)]">
                 ...
              </div> */}
              
              {/* Action Bar */}
              {(!isSubmitting && !isGeneratingRef.current && !generatedData.name) && (
                  <div className="px-4 pb-4 bg-[var(--card-bg)] flex justify-end gap-3 animate-in slide-in-from-bottom-2 pt-4 border-t border-[var(--border-color)]">
                       <button
                          onClick={() => setStep('input')}
                          className="px-4 py-2 text-sm text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] rounded-lg transition-colors flex items-center gap-2"
                        >
                          <ArrowLeft size={16} />
                          {t('common.back', 'Back')}
                        </button>
                  </div>
              )}

              {generatedData.name && (
                  <div className="px-4 pb-4 bg-[var(--card-bg)] flex justify-end gap-3 animate-in slide-in-from-bottom-2 pt-4 border-t border-[var(--border-color)]">
                       <button
                          onClick={() => setStep('input')}
                          className="px-4 py-2 text-sm text-[var(--text-color-secondary)] hover:bg-[var(--item-hover-bg)] rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => setStep('review')}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 font-medium flex items-center gap-2 transition-all"
                        >
                          {t('common.next', 'Next')}
                          <ChevronRight size={16} />
                        </button>
                  </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6 max-w-3xl mx-auto">
               <div className="flex items-center justify-between sticky top-0 bg-[var(--card-bg)]/80 backdrop-blur-md z-10 py-2 -mx-2 px-2 border-b border-[var(--border-color)]/50">
                 <h3 className="text-lg font-medium text-[var(--text-color)]">{t('role.wizard.review.title', 'Review & Create')}</h3>
                 <button 
                   onClick={() => setStep('input')}
                   className="text-sm text-[var(--text-color-secondary)] hover:text-indigo-600 flex items-center gap-1 transition-colors"
                 >
                   <ArrowLeft size={14} />
                   {t('common.back', 'Back')}
                 </button>
               </div>

               <div className="grid gap-6">
                 {/* Identity Section */}
                 <div className="bg-[var(--body-bg)] rounded-xl border border-[var(--border-color)] p-6 flex gap-6 items-start">
                    <div className="shrink-0">
                        <div className="w-20 h-20 bg-[var(--item-hover-bg)] rounded-2xl flex items-center justify-center text-4xl border border-[var(--border-color)] shadow-sm">
                            {generatedData.avatar}
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-color-secondary)] uppercase tracking-wider">{t('role.wizard.review.name', 'Role Name')}</label>
                            <input
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-indigo-500 outline-none w-full text-[var(--text-color)] transition-colors pb-1"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-color-secondary)] uppercase tracking-wider">{t('role.wizard.review.description', 'Description')}</label>
                            <input
                            value={generatedData.description || ''}
                            onChange={(e) => setGeneratedData(prev => ({...prev, description: e.target.value}))}
                            className="text-base text-[var(--text-color-secondary)] bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-indigo-500 outline-none w-full transition-colors pb-1"
                            />
                        </div>
                    </div>
                 </div>

                 {/* Configuration Section */}
                 <div className={`grid grid-cols-1 ${!isManual ? 'md:grid-cols-2' : ''} gap-6`}>
                    <div className="bg-[var(--body-bg)] rounded-xl border border-[var(--border-color)] p-5 space-y-3">
                        <label className="block text-xs font-semibold text-[var(--text-color-secondary)] uppercase">{t('role.config.prompt', '角色提示词')}</label>
                        <textarea
                            value={generatedData.prompt || ''}
                            onChange={(e) => setGeneratedData(prev => ({...prev, prompt: e.target.value}))}
                            rows={8}
                            placeholder="# 你是xxx专家&#10;&#10;## 核心能力&#10;- ...&#10;&#10;## 工作方式&#10;...&#10;&#10;## 对话风格&#10;..."
                            className="w-full p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm font-mono text-[var(--text-color)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                        />
                    </div>
                    {!isManual && (
                    <div className="bg-[var(--body-bg)] rounded-xl border border-[var(--border-color)] p-5 space-y-3">
                        <label className="block text-xs font-semibold text-[var(--text-color-secondary)] uppercase">{t('role.config.principle', 'Principle')}</label>
                        <textarea
                            value={generatedData.principle || ''}
                            onChange={(e) => setGeneratedData(prev => ({...prev, principle: e.target.value}))}
                            rows={8}
                            className="w-full p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm font-mono text-[var(--text-color)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                        />
                    </div>
                    )}
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--header-bg)] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] rounded-lg transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting || !roleName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              {t('role.wizard.create', 'Create Role')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
