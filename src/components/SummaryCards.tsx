import { motion } from 'framer-motion';
import { Lightbulb, ClipboardList, Zap, PauseCircle, CheckCircle2 } from 'lucide-react';
import { ProjectStatus } from '@/types/project';

interface SummaryCardsProps {
  ideas: number;
  planning: number;
  active: number;
  paused: number;
  finished: number;
  onFilter: (filter: ProjectStatus | 'ideas' | null) => void;
  activeFilter: ProjectStatus | 'ideas' | null;
}

const cards = [
  { key: 'ideas' as const, label: 'Ideias', icon: Lightbulb, color: 'text-warning' },
  { key: 'planning' as const, label: 'Planejamento', icon: ClipboardList, color: 'text-info' },
  { key: 'active' as const, label: 'Ativos', icon: Zap, color: 'text-primary' },
  { key: 'paused' as const, label: 'Paralisados', icon: PauseCircle, color: 'text-accent' },
  { key: 'finished' as const, label: 'Finalizados', icon: CheckCircle2, color: 'text-success' },
];

export function SummaryCards({ ideas, planning, active, paused, finished, onFilter, activeFilter }: SummaryCardsProps) {
  const counts = { ideas, planning, active, paused, finished };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => {
        const isActive = activeFilter === card.key || (card.key === 'planning' && activeFilter === 'planning') ||
          (card.key === 'active' && activeFilter === 'active') || (card.key === 'paused' && activeFilter === 'paused') ||
          (card.key === 'finished' && activeFilter === 'finished');

        return (
          <motion.button
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onFilter(isActive ? null : card.key as any)}
            className={`glass rounded-lg p-4 text-left transition-all hover:scale-[1.02] ${isActive ? 'ring-1 ring-primary glow-primary' : 'hover:glow-primary'}`}
          >
            <card.icon className={`h-5 w-5 mb-2 ${card.color}`} />
            <div className="text-2xl font-bold font-display">{counts[card.key]}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </motion.button>
        );
      })}
    </div>
  );
}
