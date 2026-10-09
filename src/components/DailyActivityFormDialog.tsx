import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailyActivity } from '@/hooks/useDailyActivities';
import { Project, Idea } from '@/types/project';
import { format, addDays, parseISO } from 'date-fns';

type Repeat = 'none' | 'daily' | 'weekdays' | 'custom';
const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function buildDates(start: string, until: string, repeat: Repeat, days: number[]): string[] {
  if (repeat === 'none' || !until) return [start];
  const out: string[] = [];
  let d = parseISO(start);
  const end = parseISO(until);
  while (d <= end && out.length < 366) {
    const wd = d.getDay();
    if (repeat === 'daily' || (repeat === 'weekdays' && wd >= 1 && wd <= 5) || (repeat === 'custom' && days.includes(wd))) {
      out.push(format(d, 'yyyy-MM-dd'));
    }
    d = addDays(d, 1);
  }
  return out.length ? out : [start];
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: Omit<DailyActivity, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  editing?: DailyActivity | null;
  projects: Project[];
  ideas?: Idea[];
  planned?: boolean;
  defaultProjectId?: string | null;
}

const CATEGORIES = ['geral', 'trabalho', 'pessoal', 'estudo', 'saúde', 'espiritual', 'financeiro', 'outro'];

export function DailyActivityFormDialog({ open, onOpenChange, onSubmit, onDelete, editing, projects, ideas = [], planned = false, defaultProjectId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('geral');
  const [activityDate, setActivityDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [projectId, setProjectId] = useState<string>('none');
  const [ideaId, setIdeaId] = useState<string>('none');
  const [duration, setDuration] = useState('');
  const [observations, setObservations] = useState('');
  const [isPlanned, setIsPlanned] = useState(planned);
  const [repeat, setRepeat] = useState<Repeat>('none');
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [until, setUntil] = useState('');
  useEffect(() => { if (open) { setRepeat('none'); setWeekDays([]); setUntil(format(addDays(new Date(), 30), 'yyyy-MM-dd')); } }, [open]);

  useEffect(() => {
    if (startTime && endTime) {
      const [h1, m1] = startTime.split(':').map(Number);
      const [h2, m2] = endTime.split(':').map(Number);
      const d = h2 * 60 + m2 - (h1 * 60 + m1);
      if (d > 0) setDuration(String(d));
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setDescription(editing.description);
        setCategory(editing.category);
        setActivityDate(editing.activityDate);
        setStartTime(editing.startTime);
        setEndTime(editing.endTime);
        setProjectId(editing.projectId || 'none');
        setIdeaId(editing.ideaId || 'none');
        setDuration(editing.durationMinutes ? String(editing.durationMinutes) : '');
        setObservations(editing.observations);
        setIsPlanned(editing.isPlanned);
      } else {
        setTitle('');
        setDescription('');
        setCategory('geral');
        setActivityDate(format(new Date(), 'yyyy-MM-dd'));
        setStartTime('');
        setEndTime('');
        setProjectId(defaultProjectId || 'none');
        setIdeaId('none');
        setDuration('');
        setObservations('');
        setIsPlanned(planned);
      }
    }
  }, [open, editing, defaultProjectId, planned]);

  const handleSave = () => {
    if (!title.trim()) return;
    const base = {
      title: title.trim(),
      description,
      category,
      startTime,
      endTime,
      projectId: projectId === 'none' ? null : projectId,
      ideaId: ideaId === 'none' ? null : ideaId,
      isPlanned,
      durationMinutes: Number(duration) || 0,
      observations,
    };
    const dates = !editing && repeat !== 'none' ? buildDates(activityDate, until, repeat, weekDays) : [activityDate];
    dates.forEach(d => onSubmit({ ...base, activityDate: d }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">
            {editing ? (isPlanned ? 'Editar Planejamento' : 'Editar Atividade') : (isPlanned ? 'Planejar Atividade' : 'Nova Atividade')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reunião com equipe" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detalhes da atividade..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hora início</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>Hora fim</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duração (minutos)</Label>
              <Input type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 60" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={isPlanned ? 'planned' : 'done'} onValueChange={(v) => setIsPlanned(v === 'planned')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planejada (futura)</SelectItem>
                  <SelectItem value="done">Realizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!editing && (
            <div className="space-y-2 border border-border/60 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Repetir</Label>
                  <Select value={repeat} onValueChange={(v: Repeat) => setRepeat(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não repetir</SelectItem>
                      <SelectItem value="daily">Todos os dias</SelectItem>
                      <SelectItem value="weekdays">Dias úteis (seg-sex)</SelectItem>
                      <SelectItem value="custom">Dias da semana...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {repeat !== 'none' && (
                  <div>
                    <Label>Repetir até</Label>
                    <Input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
                  </div>
                )}
              </div>
              {repeat === 'custom' && (
                <div className="flex gap-1 flex-wrap">
                  {WEEK.map((w, i) => (
                    <Button key={w} type="button" size="sm" variant={weekDays.includes(i) ? 'default' : 'outline'}
                      onClick={() => setWeekDays(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}>{w}</Button>
                  ))}
                </div>
              )}
              {repeat !== 'none' && (
                <p className="text-xs text-muted-foreground">Serão criadas {buildDates(activityDate, until, repeat, weekDays).length} atividade(s), a partir da data escolhida.</p>
              )}
            </div>
          )}
          <div>
            <Label>Observações</Label>
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} placeholder="Observações..." />
          </div>
          <div>
            <Label>Ideia vinculada (opcional)</Label>
            <Select value={ideaId} onValueChange={setIdeaId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem vínculo</SelectItem>
                {ideas.map(i => <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Projeto vinculado (opcional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem vínculo</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          {editing && onDelete && (
            <Button variant="destructive" onClick={() => { onDelete(editing.id); onOpenChange(false); }}>
              Excluir
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}