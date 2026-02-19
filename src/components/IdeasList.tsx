import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lightbulb, Paperclip, Trash2 } from 'lucide-react';
import { Idea } from '@/types/project';

interface IdeasListProps {
  ideas: Idea[];
  onDelete: (id: string) => void;
  onView: (idea: Idea) => void;
  onEdit: (idea: Idea) => void;
}

export function IdeasList({ ideas, onDelete, onView, onEdit }: IdeasListProps) {
  if (ideas.length === 0) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <Lightbulb className="h-8 w-8 text-warning mx-auto mb-2 opacity-50" />
        <p className="text-muted-foreground">Nenhuma ideia registrada.</p>
        <p className="text-xs text-muted-foreground mt-1">Clique em "Ideia" para registrar sua primeira.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-display text-sm tracking-widest text-muted-foreground uppercase">Ideias</h2>
      {ideas.map((idea, i) => (
        <motion.div
          key={idea.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-lg p-4 hover:glow-accent transition-all cursor-pointer"
          onClick={() => onView(idea)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                {idea.title}
              </h3>
              {idea.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>}
              {idea.observation && <p className="text-xs text-muted-foreground/70 mt-1 italic">{idea.observation}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{format(new Date(idea.createdAt), "dd MMM yyyy", { locale: ptBR })}</span>
                {idea.attachments.length > 0 && (
                  <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> {idea.attachments.length}</span>
                )}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }} className="text-muted-foreground hover:text-destructive transition-colors p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
