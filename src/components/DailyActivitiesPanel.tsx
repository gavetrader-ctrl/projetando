import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Plus, Clock, Tag, FolderKanban, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyActivity, useDailyActivities } from '@/hooks/useDailyActivities';
import { Project } from '@/types/project';
import { DailyActivityFormDialog } from './DailyActivityFormDialog';

interface Props {
  projects: Project[];
  compact?: boolean;
  defaultDateFilter?: 'today' | 'all';
}

export function DailyActivitiesPanel({ projects, compact = false, defaultDateFilter = 'all' }: Props) {
  const { activities, addActivity, updateActivity, deleteActivity } = useDailyActivities();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>(defaultDateFilter);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DailyActivity | null>(null);

  const projectName = (id: string | null) => id ? projects.find(p => p.id === id)?.name : null;

  const filtered = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    return activities.filter(a => {
      if (category !== 'all' && a.category !== category) return false;
      if (projectFilter !== 'all') {
        if (projectFilter === 'none' && a.projectId) return false;
        if (projectFilter !== 'none' && a.projectId !== projectFilter) return false;
      }
      if (dateFilter === 'today' && a.activityDate !== today) return false;
      if (dateFilter === 'week') {
        const d = parseISO(a.activityDate);
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 7 || diff < 0) return false;
      }
      if (dateFilter === 'month') {
        const d = parseISO(a.activityDate);
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const pName = projectName(a.projectId) || '';
        if (!a.title.toLowerCase().includes(q) &&
            !a.description.toLowerCase().includes(q) &&
            !a.category.toLowerCase().includes(q) &&
            !pName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activities, query, category, projectFilter, dateFilter, projects]);

  const grouped = useMemo(() => {
    const map = new Map<string, DailyActivity[]>();
    filtered.forEach(a => {
      if (!map.has(a.activityDate)) map.set(a.activityDate, []);
      map.get(a.activityDate)!.push(a);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const shown = compact ? grouped.slice(0, 2) : grouped;

  return (
    <Card className="p-4 space-y-4 bg-card/60 backdrop-blur border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display tracking-wider text-lg text-primary">Atividades Diárias</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} registro(s)</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Nova Atividade
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar por título, descrição, categoria ou projeto..." className="pl-9" />
        </div>
        <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
          <SelectTrigger className="w-full md:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as datas</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {['geral','trabalho','pessoal','estudo','saúde','espiritual','financeiro','outro'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Projeto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos projetos</SelectItem>
            <SelectItem value="none">Sem vínculo</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade encontrada.</p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {shown.map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs uppercase tracking-widest text-primary/80 font-display mb-2">
                {format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <div className="space-y-2">
                {items.map(a => {
                  const pName = projectName(a.projectId);
                  return (
                    <div key={a.id} className="border border-border/60 rounded-lg p-3 bg-background/40 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">{a.title}</span>
                            <Badge variant="outline" className="text-[10px] gap-1"><Tag className="h-3 w-3" />{a.category}</Badge>
                            {pName && <Badge variant="outline" className="text-[10px] gap-1 border-accent/40 text-accent"><FolderKanban className="h-3 w-3" />{pName}</Badge>}
                            {(a.startTime || a.endTime) && (
                              <Badge variant="outline" className="text-[10px] gap-1"><Clock className="h-3 w-3" />{a.startTime}{a.endTime && ` - ${a.endTime}`}</Badge>
                            )}
                          </div>
                          {a.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.description}</p>}
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setEditing(a); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <DailyActivityFormDialog
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}
        onSubmit={(d) => editing ? updateActivity(editing.id, d) : addActivity(d)}
        onDelete={deleteActivity}
        editing={editing}
        projects={projects}
      />
    </Card>
  );
}