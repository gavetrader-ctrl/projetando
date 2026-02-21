import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Attachment, Activity } from '@/types/project';
import {
  CalendarDays, Tag, Users, DollarSign, FileText, Pencil, ExternalLink, Copy, Upload,
  Lightbulb, Clock, TrendingUp, Paperclip, CheckCircle2, Circle, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRef, useState } from 'react';

interface ProjectViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onEdit: (project: Project) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const statusLabels = { planning: 'Planejamento', active: 'Ativo', paused: 'Paralisado', finished: 'Finalizado' };
const statusColors = { planning: 'bg-info/20 text-info', active: 'bg-primary/20 text-primary', paused: 'bg-accent/20 text-accent', finished: 'bg-success/20 text-success' };
const typeLabels: Record<string, string> = { personal: 'Pessoal', professional: 'Profissional', study: 'Estudo', financial: 'Financeiro', health: 'Saúde', spiritual: 'Espiritual', other: 'Outro' };
const priorityLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const priorityColors = { high: 'text-destructive', medium: 'text-warning', low: 'text-success' };
const returnTimelineLabels = { short: 'Curto prazo', medium: 'Médio prazo', long: 'Longo prazo' };
const returnFrequencyLabels = { once: 'Apenas uma vez', recurring: 'Recorrente' };

function AttachmentItem({ att, onUpload }: { att: Attachment; onUpload?: (id: string, file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (att.url) {
      navigator.clipboard.writeText(att.url);
      toast.success('Link copiado!');
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (att.url) window.open(att.url, '_blank', 'noopener,noreferrer');
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(att.id, file);
  };

  return (
    <div className="glass rounded-md p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm truncate flex items-center gap-2">
          <Paperclip className="h-3 w-3 text-primary shrink-0" />
          {att.name || 'Sem nome'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {att.url && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleOpen} title="Abrir">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleCopy} title="Copiar link">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleUploadClick} title="Upload">
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
      {att.description && <p className="text-xs text-muted-foreground pl-5">{att.description}</p>}
      {att.url && <p className="text-[10px] text-muted-foreground/60 pl-5 truncate">{att.url}</p>}
    </div>
  );
}

function CostTable({ label, items }: { label: string; items: { description: string; value: number }[] }) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((s, i) => s + (i.value || 0), 0);
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h4>
      {items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm py-1 border-b border-border/30">
          <span>{item.description || '—'}</span>
          <span className="text-primary font-mono">R$ {item.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      ))}
      <div className="flex justify-between text-sm font-semibold pt-1">
        <span>Subtotal</span>
        <span className="text-primary font-mono">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}

function ActivityForm({ onAdd }: { onAdd: (activity: Activity) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date: new Date().toISOString(),
      startTime,
      endTime,
      completed: false,
    });
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    toast.success('Atividade adicionada!');
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-md p-3 space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        <Plus className="h-3 w-3" /> Nova Atividade
      </h4>
      <div className="space-y-2">
        <Input
          placeholder="Título da atividade"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-muted/30 border-border text-sm"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Hora Início</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-muted/30 border-border text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hora Fim</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-muted/30 border-border text-sm"
            />
          </div>
        </div>
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-muted/30 border-border text-sm min-h-[60px]"
        />
      </div>
      <Button type="submit" size="sm" className="bg-primary text-primary-foreground gap-1 text-xs">
        <Plus className="h-3 w-3" /> Adicionar
      </Button>
    </form>
  );
}

export function ProjectViewDialog({ open, onOpenChange, project, onEdit, onUpdate }: ProjectViewDialogProps) {
  if (!project) return null;

  const handleEdit = () => {
    onOpenChange(false);
    setTimeout(() => onEdit(project), 150);
  };

  const handleAttachmentUpload = (attKey: 'studyAttachments' | 'projectAttachments') => (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    const updatedAtts = (project[attKey] || []).map(a =>
      a.id === id ? { ...a, url, name: a.name || file.name, type: file.type.startsWith('image/') ? 'image' as const : 'document' as const } : a
    );
    onUpdate(project.id, { [attKey]: updatedAtts });
    toast.success(`Arquivo "${file.name}" carregado localmente.`);
  };

  const handleAddActivity = (activity: Activity) => {
    const updatedActivities = [...(project.activities || []), activity];
    const updates: Partial<Project> = { activities: updatedActivities };

    // Auto-change status from planning to active when adding first activity
    if (project.status === 'planning') {
      updates.status = 'active';
      toast.info('Projeto alterado para Ativo automaticamente!');
    }

    onUpdate(project.id, updates);
  };

  const handleToggleActivity = (activityId: string) => {
    const updatedActivities = (project.activities || []).map(a =>
      a.id === activityId ? { ...a, completed: !a.completed } : a
    );
    onUpdate(project.id, { activities: updatedActivities });
  };

  const handleDeleteActivity = (activityId: string) => {
    const updatedActivities = (project.activities || []).filter(a => a.id !== activityId);
    onUpdate(project.id, { activities: updatedActivities });
    toast.success('Atividade removida.');
  };

  const fin = project.financial;
  const totalCosts = [
    ...(fin?.fixedCosts || []),
    ...(fin?.variableCosts || []),
    ...(fin?.reserve || []),
    ...(fin?.unexpected || []),
  ].reduce((s, i) => s + (i.value || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-display gradient-text text-xl mb-2">{project.name}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" /> {typeLabels[project.type]}
                  </span>
                  <span className={`text-xs ${priorityColors[project.priority]}`}>
                    ● {priorityLabels[project.priority]}
                  </span>
                </div>
              </div>
              <Button onClick={handleEdit} className="bg-primary text-primary-foreground gap-2 shrink-0">
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            </div>
          </DialogHeader>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-primary font-display font-semibold">{project.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="progress-bar h-full" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="p-6 pt-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="overview" className="flex-1 text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="attachments" className="flex-1 text-xs">Anexos</TabsTrigger>
            <TabsTrigger value="financial" className="flex-1 text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="activities" className="flex-1 text-xs">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {project.description && (
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descrição</h4>
                <p className="text-sm leading-relaxed">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {project.startDate && (
                <div className="glass rounded-md p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CalendarDays className="h-3 w-3" /> Período
                  </div>
                  <p className="text-sm font-medium">
                    {format(new Date(project.startDate), "dd MMM yyyy", { locale: ptBR })}
                    {project.endDate && ` → ${format(new Date(project.endDate), "dd MMM yyyy", { locale: ptBR })}`}
                  </p>
                </div>
              )}

              <div className="glass rounded-md p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" /> Retorno
                </div>
                <p className="text-sm font-medium">
                  {returnTimelineLabels[project.returnTimeline]} · {returnFrequencyLabels[project.returnFrequency]}
                </p>
              </div>
            </div>

            {project.hasParticipants && project.participants.length > 0 && (
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Participantes
                </h4>
                <div className="space-y-1">
                  {project.participants.map(p => (
                    <div key={p.id} className="glass rounded-md px-3 py-2 flex justify-between text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.observations && (
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observações</h4>
                <p className="text-sm text-muted-foreground italic">{project.observations}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4 mt-4">
            {(project.studyAttachments?.length > 0 || project.projectAttachments?.length > 0) ? (
              <>
                {project.studyAttachments?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Anexos de Estudo
                    </h4>
                    <div className="space-y-2">
                      {project.studyAttachments.map(att => (
                        <AttachmentItem key={att.id} att={att} onUpload={handleAttachmentUpload('studyAttachments')} />
                      ))}
                    </div>
                  </div>
                )}
                {project.projectAttachments?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Anexos do Projeto
                    </h4>
                    <div className="space-y-2">
                      {project.projectAttachments.map(att => (
                        <AttachmentItem key={att.id} att={att} onUpload={handleAttachmentUpload('projectAttachments')} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum anexo registrado.</p>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-md p-3 text-center">
                <p className="text-xs text-muted-foreground">Orçamento</p>
                <p className="text-lg font-display text-primary font-semibold">
                  R$ {(fin?.totalBudget || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="glass rounded-md p-3 text-center">
                <p className="text-xs text-muted-foreground">Custos Totais</p>
                <p className="text-lg font-display text-destructive font-semibold">
                  R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {fin?.goal && (
              <div className="glass rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Meta do Projeto</p>
                <p className="text-sm font-medium">{fin.goal}</p>
              </div>
            )}

            <CostTable label="Custos Fixos" items={fin?.fixedCosts || []} />
            <CostTable label="Custos Variáveis" items={fin?.variableCosts || []} />
            <CostTable label="Reserva" items={fin?.reserve || []} />
            <CostTable label="Imprevistos" items={fin?.unexpected || []} />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4 mt-4">
            <ActivityForm onAdd={handleAddActivity} />

            {(project.activities?.length > 0) ? (
              project.activities.map(act => (
                <div key={act.id} className="glass rounded-md p-3 flex items-start gap-3">
                  <button onClick={() => handleToggleActivity(act.id)} className="mt-0.5 shrink-0">
                    {act.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${act.completed ? 'line-through text-muted-foreground' : ''}`}>{act.title}</p>
                    {(act.startTime || act.endTime) && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {act.startTime && act.startTime}{act.startTime && act.endTime && ' — '}{act.endTime && act.endTime}
                      </p>
                    )}
                    {act.description && <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>}
                    {act.date && <p className="text-[10px] text-muted-foreground/60 mt-1">{format(new Date(act.date), "dd MMM yyyy", { locale: ptBR })}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDeleteActivity(act.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
