
import React from 'react';

// This is a simplified markdown renderer. For a full implementation, a library like 'react-markdown' would be used.
// This version handles basic formatting like headings, bold, italics, lists, and code blocks.
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderLines = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockContent = '';

    const elements = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${i}`} className="bg-slate-900/70 p-4 rounded-md my-4 overflow-x-auto">
                        <code className="text-sm font-mono text-cyan-300">{codeBlockContent}</code>
                    </pre>
                );
                codeBlockContent = '';
            }
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += line + '\n';
            continue;
        }
        
        // Headings
        if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-xl font-semibold mt-3 mb-1">{line.substring(3)}</h2>);
        } else if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-lg font-medium mt-2">{line.substring(4)}</h3>);
        // Unordered List
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            elements.push(<li key={i} className="ml-6 list-disc">{line.substring(2)}</li>);
        // Basic bold/italic replacement
        } else {
             const parts = line.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g);
             const renderedParts = parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }
                return part;
             });
             elements.push(<p key={i} className="my-1">{renderedParts}</p>);
        }
    }

     if (inCodeBlock && codeBlockContent) {
        elements.push(
            <pre key="final-code" className="bg-slate-900/70 p-4 rounded-md my-4 overflow-x-auto">
                <code className="text-sm font-mono text-cyan-300">{codeBlockContent}</code>
            </pre>
        );
    }
    
    return elements;
  };
  
  return <div className="prose prose-invert max-w-none text-slate-300">{renderLines(content)}</div>;
};
