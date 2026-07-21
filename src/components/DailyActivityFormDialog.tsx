import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailyActivity } from '@/hooks/useDailyActivities';
import { Project } from '@/types/project';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: Omit<DailyActivity, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  editing?: DailyActivity | null;
  projects: Project[];
  defaultProjectId?: string | null;
}

const CATEGORIES = ['geral', 'trabalho', 'pessoal', 'estudo', 'saúde', 'espiritual', 'financeiro', 'outro'];

export function DailyActivityFormDialog({ open, onOpenChange, onSubmit, onDelete, editing, projects, defaultProjectId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('geral');
  const [activityDate, setActivityDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [projectId, setProjectId] = useState<string>('none');

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
      } else {
        setTitle('');
        setDescription('');
        setCategory('geral');
        setActivityDate(format(new Date(), 'yyyy-MM-dd'));
        setStartTime('');
        setEndTime('');
        setProjectId(defaultProjectId || 'none');
      }
    }
  }, [open, editing, defaultProjectId]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description,
      category,
      activityDate,
      startTime,
      endTime,
      projectId: projectId === 'none' ? null : projectId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">
            {editing ? 'Editar Atividade' : 'Nova Atividade'}
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