import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NOTE_THEMES } from '@/types/note';
import { StickyNote, Calendar, Clock } from 'lucide-react';

interface NoteBlockData {
  label: string;
  content: string;
  theme: string;
  emojiTag: string;
  fontSize: number;
  fontColor: string;
  createdAt: string;
  noteId: string;
}

function NoteBlockComponent({ data }: { data: NoteBlockData }) {
  const { label, content, theme, emojiTag, fontSize, fontColor, createdAt } = data;
  const themeConfig = NOTE_THEMES[theme] || NOTE_THEMES.default;

  const createdDate = new Date(createdAt);
  const dateStr = createdDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeStr = createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Parse simple markdown-like formatting in content
  const renderContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Table detection: lines with |
      if (line.includes('|') && line.trim().startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '');
        if (cells.length > 0 && !line.match(/^[\s|:-]+$/)) {
          return (
            <div key={i} className="flex gap-1 text-[10px]">
              {cells.map((cell, j) => (
                <span key={j} className="px-1 py-0.5 border border-border/30 rounded flex-1 text-center truncate">
                  {cell.trim()}
                </span>
              ))}
            </div>
          );
        }
        return null;
      }
      // Bold: **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="leading-tight" style={{ fontSize: `${Math.max(fontSize - 2, 9)}px` }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
      style={{
        background: themeConfig.bg,
        borderColor: themeConfig.border,
        boxShadow: `0 0 20px ${themeConfig.border}20`,
        minWidth: 220,
        maxWidth: 320,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary !border-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-primary !border-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-primary !border-primary !w-2 !h-2" />

      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: `${themeConfig.border}40` }}
      >
        {emojiTag ? (
          <span className="text-base">{emojiTag}</span>
        ) : (
          <StickyNote className="h-3.5 w-3.5 shrink-0" style={{ color: themeConfig.border }} />
        )}
        <span
          className="font-semibold text-xs truncate flex-1"
          style={{ color: fontColor || themeConfig.border, fontSize: `${fontSize}px` }}
        >
          {label || 'Sem título'}
        </span>
      </div>

      {/* Content */}
      {content && (
        <div className="px-3 py-2 space-y-0.5 max-h-[120px] overflow-hidden" style={{ color: fontColor || 'hsl(200 20% 80%)' }}>
          {renderContent(content)}
        </div>
      )}

      {/* Footer: date/time */}
      <div className="px-3 py-1.5 flex items-center gap-3 text-[9px] text-muted-foreground border-t" style={{ borderColor: `${themeConfig.border}20` }}>
        <span className="flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5" />
          {dateStr}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {timeStr}
        </span>
      </div>
    </div>
  );
}

export const NoteBlock = memo(NoteBlockComponent);
