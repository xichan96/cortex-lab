export interface ExtractedContent {
  type: 'code' | 'text' | 'mixed';
  content: string;
  language?: string;
  confidence: number;
}

const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;
const INLINE_CODE_REGEX = /`([^`]+)`/g;

export function extractCodeBlocks(content: string): ExtractedContent[] {
  const results: ExtractedContent[] = [];
  const codeBlocks: string[] = [];
  
  let match;
  while ((match = CODE_BLOCK_REGEX.exec(content)) !== null) {
    const language = match[1] || '';
    const code = match[2].trim();
    
    if (code.length > 0) {
      codeBlocks.push(code);
      results.push({
        type: 'code',
        content: code,
        language: language.toLowerCase(),
        confidence: language ? 0.9 : 0.7,
      });
    }
  }
  
  if (results.length === 0) {
    const text = content.trim();
    if (text.length > 0) {
      results.push({
        type: 'text',
        content: text,
        confidence: 0.5,
      });
    }
  }
  
  return results;
}

export function isPromptContent(content: string): boolean {
  if (!content || content.trim().length === 0) {
    return false;
  }

  const extracted = extractCodeBlocks(content);
  
  if (extracted.length > 0) {
    const hasCodeBlock = extracted.some(e => e.type === 'code');
    if (hasCodeBlock) {
      const markdownLanguages = ['markdown', 'md', 'text', 'txt', 'prompt'];
      const hasPromptLanguage = extracted.some(e => 
        e.language && markdownLanguages.includes(e.language)
      );
      
      if (hasPromptLanguage) {
        return true;
      }
      
      const codeContent = extracted.find(e => e.type === 'code')?.content || '';
      if (codeContent.length > 50 && !isChatContent(codeContent)) {
        return true;
      }
    }
  }

  const textContent = content.replace(CODE_BLOCK_REGEX, '').trim();
  
  if (textContent.length > 100) {
    if (isChatContent(textContent)) {
      return false;
    }
    
    const promptKeywords = [
      'system', 'user', 'assistant', 'role', 
      'prompt', 'system message', 'system prompt',
      'instruction', 'guideline', 'template'
    ];
    const lowerContent = textContent.toLowerCase();
    const keywordCount = promptKeywords.filter(kw => lowerContent.includes(kw)).length;
    
    if (keywordCount >= 2) {
      return true;
    }
    
    if (textContent.length > 200 && keywordCount >= 1) {
      return true;
    }
  }

  return false;
}

function isChatContent(content: string): boolean {
  const chatPhrases = [
    /^(你好|谢谢|请问|好的|明白了|了解|收到|感谢)/,
    /(请问|可以|能否|帮我|麻烦)/,
    /(怎么样|如何|什么|为什么)/,
    /(明白了|知道了|好的|收到|谢谢)/,
  ];
  
  const trimmed = content.trim();
  return chatPhrases.some(regex => regex.test(trimmed));
}

export function shouldAutoApply(userMessage: string): boolean {
  if (!userMessage || userMessage.trim().length === 0) {
    return false;
  }

  const keywords = [
    '生成', '写', '创建', '帮我', 'prompt', '提示词', 
    '编写', '制作', '给出', '提供', '输出', '返回',
    'generate', 'create', 'write', 'make', 'give'
  ];
  const lowerMessage = userMessage.toLowerCase();
  return keywords.some(keyword => lowerMessage.includes(keyword));
}

export function extractPromptContent(content: string): string {
  const extracted = extractCodeBlocks(content);
  
  if (extracted.length === 0) {
    return content.trim();
  }
  
  const codeBlocks = extracted.filter(e => e.type === 'code');
  if (codeBlocks.length > 0) {
    const markdownBlocks = codeBlocks.filter(e => 
      e.language && ['markdown', 'md', 'text', 'txt', 'prompt'].includes(e.language)
    );
    
    if (markdownBlocks.length > 0) {
      return markdownBlocks[0].content;
    }
    
    return codeBlocks[0].content;
  }
  
  return extracted[0]?.content || content.trim();
}

