import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Tag, Eye, Pencil, Plus, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project, ProjectStatus } from '@/types/project';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProjectListProps {
  projects: Project[];
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onAddActivity: (project: Project) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
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

export function ProjectList({ projects, onView, onEdit, onAddActivity, onUpdate }: ProjectListProps) {
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [pausingProject, setPausingProject] = useState<Project | null>(null);
  const [pauseReason, setPauseReason] = useState('');

  const handlePauseClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setPausingProject(project);
    setPauseReason('');
    setPauseDialogOpen(true);
  };

  const handleConfirmPause = () => {
    if (!pausingProject || !pauseReason.trim()) return;
    onUpdate(pausingProject.id, { status: 'paused', pauseReason: pauseReason.trim() });
    toast.success('Projeto paralisado.');
    setPauseDialogOpen(false);
    setPausingProject(null);
  };

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
          onClick={() => onView(project)}
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
            <div className="flex gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); onAddActivity(project); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Adicionar Atividade</TooltipContent>
              </Tooltip>
              {project.status !== 'paused' && project.status !== 'finished' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-warning" onClick={(e) => handlePauseClick(e, project)}>
                      <PauseCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Paralisar Projeto</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); onView(project); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visualizar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent-foreground" onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Pause reason banner */}
          {project.status === 'paused' && project.pauseReason && (
            <div className="mt-2 px-3 py-2 rounded-md bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium flex items-center gap-1">
                <PauseCircle className="h-3 w-3" /> Motivo da paralização:
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{project.pauseReason}</p>
            </div>
          )}

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

      {/* Pause Dialog */}
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent className="glass border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-display gradient-text">Paralisar Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Informe o motivo da paralização de <strong>{pausingProject?.name}</strong>:
            </p>
            <div>
              <Label className="text-xs text-muted-foreground">Motivo *</Label>
              <Textarea
                placeholder="Descreva o motivo da paralização..."
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                className="bg-muted/30 border-border text-sm min-h-[80px] mt-1"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPauseDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmPause} disabled={!pauseReason.trim()} className="bg-warning text-warning-foreground hover:bg-warning/90">
                <PauseCircle className="h-4 w-4 mr-1" /> Paralisar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
