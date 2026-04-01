import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lightbulb, FolderKanban, CheckCircle2, Circle, Users, Paperclip } from 'lucide-react';

interface DetailItem {
  key: string;
  value: string;
}

interface MindMapNodeData {
  label: string;
  nodeType: 'root' | 'branch' | 'project' | 'idea' | 'leaf';
  color: string;
  details?: DetailItem[];
  description?: string;
  completed?: boolean;
}

function MindMapNodeComponent({ data }: { data: MindMapNodeData }) {
  const { label, nodeType, color, details, description, completed } = data;

  if (nodeType === 'root') {
    return (
      <div
        className="px-6 py-4 rounded-2xl text-center font-bold text-display tracking-wider text-sm border-2 animate-glow-pulse"
        style={{
          background: 'hsl(220 18% 10%)',
          borderColor: color,
          color: color,
          boxShadow: `0 0 30px ${color}40`,
        }}
      >
        <Handle type="source" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
        <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-0 !w-0 !h-0" />
        {label}
      </div>
    );
  }

  if (nodeType === 'branch') {
    return (
      <div
        className="px-5 py-3 rounded-xl font-semibold text-display text-xs tracking-wide border"
        style={{
          background: 'hsl(220 18% 12%)',
          borderColor: `${color}80`,
          color: color,
          boxShadow: `0 0 15px ${color}20`,
        }}
      >
        <Handle type="target" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
        <Handle type="source" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
        <Handle type="target" position={Position.Left} id="left-target" className="!bg-transparent !border-0 !w-0 !h-0" />
        <Handle type="source" position={Position.Right} id="right-source" className="!bg-transparent !border-0 !w-0 !h-0" />
        {label}
      </div>
    );
  }

  if (nodeType === 'leaf') {
    return (
      <div
        className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border"
        style={{
          background: 'hsl(220 18% 10%)',
          borderColor: `${color}50`,
          color: `${color}`,
        }}
      >
        <Handle type="target" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
        <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-0 !w-0 !h-0" />
        {completed !== undefined ? (
          completed ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <Circle className="h-3 w-3 shrink-0" />
        ) : null}
        <span className={completed ? 'line-through opacity-70' : ''}>{label}</span>
      </div>
    );
  }

  // Project or Idea node
  const isIdea = nodeType === 'idea';
  const Icon = isIdea ? Lightbulb : FolderKanban;

  return (
    <div
      className="rounded-xl border min-w-[200px] max-w-[260px] overflow-hidden"
      style={{
        background: 'hsl(220 18% 10%)',
        borderColor: `${color}60`,
        boxShadow: `0 0 20px ${color}15`,
      }}
    >
      <Handle type="target" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-transparent !border-0 !w-0 !h-0" />

      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: `${color}30` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="font-semibold text-xs truncate" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Description */}
      {description && (
        <div className="px-3 py-1.5">
          <p className="text-[10px] text-muted-foreground line-clamp-2">{description}</p>
        </div>
      )}

      {/* Details */}
      {details && details.length > 0 && (
        <div className="px-3 py-1.5 space-y-1">
          {details.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{d.key}</span>
              <span className="font-medium" style={{ color: `${color}CC` }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);
