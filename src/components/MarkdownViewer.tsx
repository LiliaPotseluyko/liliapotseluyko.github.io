import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Simple, safe inline parser for basic markdown tags (bold, italic, code blocks, lists)
  const renderFormattedText = (text: string) => {
    // Split code blocks ```lang code ```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        code: match[2].trim(),
        index: blockIndex++,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return parts.map((part, pIdx) => {
      if (part.type === 'code') {
        const isCopied = copiedCodeIndex === part.index;
        return (
          <div
            key={`code-${pIdx}`}
            className="my-3 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden text-xs font-mono shadow-sm"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-slate-300">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-400">
                {part.language || 'code'}
              </span>
              <button
                onClick={() => handleCopyCode(part.code, part.index)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-slate-100 leading-relaxed">
              <code>{part.code}</code>
            </pre>
          </div>
        );
      }

      // Process normal paragraph text, list items, and bolding
      const lines = part.content.split('\n');
      return (
        <div key={`text-${pIdx}`} className="space-y-1.5 text-slate-800 dark:text-slate-200">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={`line-${lIdx}`} className="h-1" />;

            // Headings
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={`h3-${lIdx}`} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">
                  {formatInlineText(trimmed.replace('### ', ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={`h2-${lIdx}`} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
                  {formatInlineText(trimmed.replace('## ', ''))}
                </h3>
              );
            }

            // Bullet lists
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={`bullet-${lIdx}`} className="flex items-start gap-2 ml-1 my-0.5">
                  <span className="text-indigo-500 font-bold select-none">•</span>
                  <span className="leading-relaxed">{formatInlineText(trimmed.substring(2))}</span>
                </div>
              );
            }

            // Numbered list
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={`num-${lIdx}`} className="flex items-start gap-2 ml-1 my-0.5">
                  <span className="text-indigo-500 font-semibold select-none">{numMatch[1]}.</span>
                  <span className="leading-relaxed">{formatInlineText(numMatch[2])}</span>
                </div>
              );
            }

            return (
              <p key={`p-${lIdx}`} className="leading-relaxed my-1">
                {formatInlineText(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const formatInlineText = (inline: string) => {
    // Process **bold** and `code`
    const boldRegex = /\*\*(.*?)\*\*/g;
    const elements = [];
    let lastIdx = 0;
    let bMatch;

    while ((bMatch = boldRegex.exec(inline)) !== null) {
      if (bMatch.index > lastIdx) {
        elements.push(inline.substring(lastIdx, bMatch.index));
      }
      elements.push(
        <strong key={`b-${bMatch.index}`} className="font-semibold text-slate-900 dark:text-white">
          {bMatch[1]}
        </strong>
      );
      lastIdx = bMatch.index + bMatch[0].length;
    }

    if (lastIdx < inline.length) {
      elements.push(inline.substring(lastIdx));
    }

    return elements;
  };

  return <div className="markdown-content">{renderFormattedText(content)}</div>;
};
