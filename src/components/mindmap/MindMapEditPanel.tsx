import { useState, useEffect } from 'react';
import { X, Save, FolderKanban, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Project, Idea, ProjectStatus, Priority } from '@/types/project';
import { toast } from 'sonner';

interface MindMapEditPanelProps {
  project: Project | null;
  idea: Idea | null;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onUpdateIdea: (idea: Idea) => void;
  onClose: () => void;
}

export function MindMapEditPanel({ project, idea, onUpdateProject, onUpdateIdea, onClose }: MindMapEditPanelProps) {
  // Project fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [progress, setProgress] = useState(0);
  const [observations, setObservations] = useState('');

  // Idea fields
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaObservation, setIdeaObservation] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setPriority(project.priority);
      setProgress(project.progress);
      setObservations(project.observations);
    }
  }, [project]);

  useEffect(() => {
    if (idea) {
      setIdeaTitle(idea.title);
      setIdeaDescription(idea.description);
      setIdeaObservation(idea.observation);
    }
  }, [idea]);

  const handleSaveProject = () => {
    if (!project) return;
    onUpdateProject(project.id, {
      name,
      description,
      status,
      priority,
      progress,
      observations,
    });
    toast.success('Projeto atualizado!');
  };

  const handleSaveIdea = () => {
    if (!idea) return;
    onUpdateIdea({
      ...idea,
      title: ideaTitle,
      description: ideaDescription,
      observation: ideaObservation,
    });
    toast.success('Ideia atualizada!');
  };

  if (project) {
    return (
      <div className="w-[320px] h-full border-l border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-display tracking-wide text-primary">Editar Projeto</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="bg-secondary border-border resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planejamento</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Prioridade</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Progresso: {progress}%</label>
            <Slider
              value={[progress]}
              onValueChange={([v]) => setProgress(v)}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Observações</label>
            <Textarea value={observations} onChange={e => setObservations(e.target.value)} rows={3} className="bg-secondary border-border resize-none" />
          </div>

          {/* Activity summary */}
          {project.activities.length > 0 && (
            <div className="glass rounded-lg p-3">
              <label className="text-xs text-muted-foreground mb-2 block font-semibold">Atividades</label>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {project.activities.map(a => (
                  <div key={a.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${a.completed ? 'bg-green-500' : 'bg-blue-400'}`} />
                    <span className={a.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSaveProject} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    );
  }

  if (idea) {
    return (
      <div className="w-[320px] h-full border-l border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <span className="font-semibold text-sm text-display tracking-wide" style={{ color: 'hsl(40 90% 55%)' }}>Editar Ideia</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Título</label>
            <Input value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} className="bg-secondary border-border" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
            <Textarea value={ideaDescription} onChange={e => setIdeaDescription(e.target.value)} rows={4} className="bg-secondary border-border resize-none" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Observação</label>
            <Textarea value={ideaObservation} onChange={e => setIdeaObservation(e.target.value)} rows={3} className="bg-secondary border-border resize-none" />
          </div>

          {idea.attachments.length > 0 && (
            <div className="glass rounded-lg p-3">
              <label className="text-xs text-muted-foreground mb-2 block font-semibold">Anexos</label>
              <div className="space-y-1.5">
                {idea.attachments.map(att => (
                  <div key={att.id} className="text-xs text-foreground">{att.name}</div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSaveIdea} className="w-full gap-2" style={{ background: 'hsl(40 90% 55%)', color: 'hsl(40 90% 10%)' }}>
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
