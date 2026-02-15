import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Tag } from 'lucide-react';
import { Project, ProjectStatus } from '@/types/project';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: 'Planejamento',
  active: 'Ativo',
  paused: 'Paralisado',
  finished: 'Finalizado',
};

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-info/20 text-info',
  active: 'bg-primary/20 text-primary',
  paused: 'bg-accent/20 text-accent',
  finished: 'bg-success/20 text-success',
};

const priorityLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const priorityColors = { high: 'text-destructive', medium: 'text-warning', low: 'text-success' };

const typeLabels: Record<string, string> = {
  personal: 'Pessoal', professional: 'Profissional', study: 'Estudo',
  financial: 'Financeiro', health: 'Saúde', spiritual: 'Espiritual', other: 'Outro',
};

export function ProjectList({ projects, onEdit }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
        <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Projeto" para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-display text-sm tracking-widest text-muted-foreground uppercase">Projetos</h2>
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-lg p-4 hover:glow-primary transition-all cursor-pointer"
          onClick={() => onEdit(project)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold truncate">{project.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {project.startDate && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(new Date(project.startDate), "dd MMM yyyy", { locale: ptBR })}
                    {project.endDate && ` → ${format(new Date(project.endDate), "dd MMM yyyy", { locale: ptBR })}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {typeLabels[project.type]}
                </span>
                <span className={priorityColors[project.priority]}>
                  ● {priorityLabels[project.priority]}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-primary font-display">{project.progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="progress-bar h-full" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
