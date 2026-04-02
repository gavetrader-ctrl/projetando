import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useIdeas } from '@/store/useStore';
import { Project, Idea } from '@/types/project';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, Folder, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addHours, addDays, addWeeks, addMonths, startOfDay, startOfWeek, startOfMonth,
  startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, format, differenceInMinutes,
  differenceInHours, differenceInDays, isWithinInterval, subHours, subDays, subWeeks,
  subMonths, parseISO, isBefore, isAfter,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TimeFilter = '6h' | 'day' | 'week' | 'month' | 'semester' | 'year';

interface TimelineItem {
  id: string;
  type: 'project' | 'idea';
  title: string;
  startDate: Date;
  endDate: Date | null;
  status?: string;
  priority?: string;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'hsl(var(--accent))',
  active: 'hsl(var(--primary))',
  paused: 'hsl(var(--muted-foreground))',
  finished: 'hsl(142 71% 45%)',
};

function getRange(filter: TimeFilter, anchor: Date): { start: Date; end: Date; slots: Date[]; labelFn: (d: Date) => string } {
  let start: Date, end: Date, slots: Date[] = [];
  let labelFn: (d: Date) => string = (d) => format(d, 'dd/MM');

  switch (filter) {
    case '6h': {
      start = new Date(anchor);
      start.setMinutes(0, 0, 0);
      start = subHours(start, start.getHours() % 6);
      end = addHours(start, 6);
      for (let t = new Date(start); isBefore(t, end); t = addHours(t, 1)) slots.push(new Date(t));
      labelFn = (d) => format(d, 'HH:mm');
      break;
    }
    case 'day': {
      start = startOfDay(anchor);
      end = endOfDay(anchor);
      for (let t = new Date(start); isBefore(t, end); t = addHours(t, 2)) slots.push(new Date(t));
      labelFn = (d) => format(d, 'HH:mm');
      break;
    }
    case 'week': {
      start = startOfWeek(anchor, { locale: ptBR });
      end = endOfWeek(anchor, { locale: ptBR });
      for (let t = new Date(start); !isAfter(t, end); t = addDays(t, 1)) slots.push(new Date(t));
      labelFn = (d) => format(d, 'EEE dd', { locale: ptBR });
      break;
    }
    case 'month': {
      start = startOfMonth(anchor);
      end = endOfMonth(anchor);
      for (let t = new Date(start); !isAfter(t, end); t = addDays(t, 1)) slots.push(new Date(t));
      labelFn = (d) => format(d, 'dd');
      break;
    }
    case 'semester': {
      const m = anchor.getMonth();
      const semStart = m < 6 ? 0 : 6;
      start = new Date(anchor.getFullYear(), semStart, 1);
      end = new Date(anchor.getFullYear(), semStart + 6, 0, 23, 59, 59);
      for (let t = new Date(start); !isAfter(t, end); t = addMonths(t, 1)) slots.push(new Date(t));
      labelFn = (d) => format(d, 'MMM', { locale: ptBR });
      break;
    }
    case 'year': {
      start = startOfYear(anchor);
      end = endOfYear(anchor);
      for (let t = new Date(start); !isAfter(t, end); t = addMonths(t, 1)) slots.push(new Date(t));
      labelFn = (d) => format(d, 'MMM', { locale: ptBR });
      break;
    }
  }
  return { start, end, slots, labelFn };
}

function navigate_time(filter: TimeFilter, anchor: Date, direction: 1 | -1): Date {
  switch (filter) {
    case '6h': return direction === 1 ? addHours(anchor, 6) : subHours(anchor, 6);
    case 'day': return direction === 1 ? addDays(anchor, 1) : subDays(anchor, 1);
    case 'week': return direction === 1 ? addWeeks(anchor, 1) : subWeeks(anchor, 1);
    case 'month': return direction === 1 ? addMonths(anchor, 1) : subMonths(anchor, 1);
    case 'semester': return direction === 1 ? addMonths(anchor, 6) : subMonths(anchor, 6);
    case 'year': return direction === 1 ? addMonths(anchor, 12) : subMonths(anchor, 12);
  }
}

function getRangeLabel(filter: TimeFilter, anchor: Date): string {
  switch (filter) {
    case '6h': {
      const s = new Date(anchor); s.setMinutes(0, 0, 0); 
      return `${format(s, "dd/MM HH:mm")} – ${format(addHours(s, 6), "HH:mm")}`;
    }
    case 'day': return format(anchor, "EEEE, dd 'de' MMMM", { locale: ptBR });
    case 'week': {
      const s = startOfWeek(anchor, { locale: ptBR });
      const e = endOfWeek(anchor, { locale: ptBR });
      return `${format(s, 'dd/MM')} – ${format(e, 'dd/MM/yyyy')}`;
    }
    case 'month': return format(anchor, "MMMM 'de' yyyy", { locale: ptBR });
    case 'semester': {
      const m = anchor.getMonth();
      return m < 6 ? `1º Semestre ${anchor.getFullYear()}` : `2º Semestre ${anchor.getFullYear()}`;
    }
    case 'year': return `${anchor.getFullYear()}`;
  }
}

export default function Timeline() {
  const { projects } = useProjects();
  const { ideas } = useIdeas();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TimeFilter>('month');
  const [anchor, setAnchor] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = [];
    projects.forEach(p => {
      if (!p.startDate) return;
      const sd = parseISO(p.startDate);
      if (isNaN(sd.getTime())) return;
      const ed = p.endDate ? parseISO(p.endDate) : null;
      result.push({
        id: p.id,
        type: 'project',
        title: p.name,
        startDate: sd,
        endDate: ed && !isNaN(ed.getTime()) ? ed : null,
        status: p.status,
        priority: p.priority,
        color: STATUS_COLORS[p.status] || 'hsl(var(--primary))',
      });
    });
    ideas.forEach(i => {
      if (!i.createdAt) return;
      const sd = parseISO(i.createdAt);
      if (isNaN(sd.getTime())) return;
      result.push({
        id: i.id,
        type: 'idea',
        title: i.title,
        startDate: sd,
        endDate: null,
        color: 'hsl(var(--accent))',
      });
    });
    return result.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [projects, ideas]);

  const { start, end, slots, labelFn } = useMemo(() => getRange(filter, anchor), [filter, anchor]);
  const totalMs = end.getTime() - start.getTime();

  const visibleItems = useMemo(() => {
    return items.filter(item => {
      const itemEnd = item.endDate || item.startDate;
      return !isAfter(item.startDate, end) && !isBefore(itemEnd, start);
    });
  }, [items, start, end]);

  // Assign rows to avoid overlap
  const rows = useMemo(() => {
    const assigned: { item: TimelineItem; row: number }[] = [];
    const rowEnds: number[] = [];
    visibleItems.forEach(item => {
      const itemStart = Math.max(item.startDate.getTime(), start.getTime());
      let row = 0;
      while (row < rowEnds.length && rowEnds[row] > itemStart) row++;
      if (row >= rowEnds.length) rowEnds.push(0);
      const itemEnd = item.endDate ? Math.min(item.endDate.getTime(), end.getTime()) : itemStart + totalMs * 0.05;
      rowEnds[row] = itemEnd;
      assigned.push({ item, row });
    });
    return assigned;
  }, [visibleItems, start, end, totalMs]);

  const maxRow = rows.reduce((max, r) => Math.max(max, r.row), 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold gradient-text tracking-wider">Timeline</h1>
      </header>

      {/* Filter bar */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center gap-3 border-b border-border bg-card/50">
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as TimeFilter)} className="bg-secondary/50 rounded-lg p-1">
          {[
            { value: '6h', label: '6h' },
            { value: 'day', label: 'Dia' },
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'semester', label: 'Semestre' },
            { value: 'year', label: 'Ano' },
          ].map(opt => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md transition-colors"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setAnchor(a => navigate_time(filter, a, -1))} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[180px] text-center capitalize">
            {getRangeLabel(filter, anchor)}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setAnchor(a => navigate_time(filter, a, 1))} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())} className="text-xs ml-2">
            Hoje
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-x-auto" ref={scrollRef}>
        <div className="min-w-[800px]">
          {/* Time slots header */}
          <div className="flex border-b border-border bg-card/30 sticky top-0 z-10">
            {slots.map((slot, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[10px] sm:text-xs text-muted-foreground py-2 border-r border-border/50 capitalize"
              >
                {labelFn(slot)}
              </div>
            ))}
          </div>

          {/* Bars area */}
          <div className="relative" style={{ minHeight: Math.max((maxRow + 1) * 44 + 20, 200) }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {slots.map((_, i) => (
                <div key={i} className="flex-1 border-r border-border/20" />
              ))}
            </div>

            {/* Now marker */}
            {(() => {
              const now = new Date();
              if (!isBefore(now, start) && !isAfter(now, end)) {
                const pct = ((now.getTime() - start.getTime()) / totalMs) * 100;
                return (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-destructive/70 z-20"
                    style={{ left: `${pct}%` }}
                  >
                    <div className="absolute -top-0 -translate-x-1/2 bg-destructive text-destructive-foreground text-[9px] px-1 rounded-b">
                      Agora
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Items */}
            {rows.map(({ item, row }) => {
              const itemStart = Math.max(item.startDate.getTime(), start.getTime());
              const isPointEvent = !item.endDate;
              const itemEnd = item.endDate ? Math.min(item.endDate.getTime(), end.getTime()) : itemStart;
              const left = ((itemStart - start.getTime()) / totalMs) * 100;
              const width = isPointEvent ? 0 : Math.max(((itemEnd - itemStart) / totalMs) * 100, 1.5);

              if (isPointEvent) {
                return (
                  <div
                    key={item.id}
                    className="absolute flex items-center gap-1.5 cursor-default z-10 hover:z-30 transition-transform hover:scale-110"
                    style={{
                      left: `${left}%`,
                      top: row * 44 + 10,
                      transform: 'translateX(-50%)',
                    }}
                    title={`${item.title} — ${format(item.startDate, 'dd/MM/yyyy HH:mm')}`}
                  >
                    <div
                      className="w-5 h-5 rotate-45 rounded-sm shadow-md border border-border/50 flex items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      <Lightbulb className="h-3 w-3 -rotate-45 shrink-0" style={{ color: 'hsl(var(--accent-foreground))' }} />
                    </div>
                    <span className="text-[10px] font-medium text-foreground whitespace-nowrap ml-1">{item.title}</span>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="absolute flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium cursor-default truncate shadow-md transition-transform hover:scale-[1.02] hover:z-30"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: row * 44 + 10,
                    height: 32,
                    backgroundColor: item.color,
                    color: 'hsl(var(--primary-foreground))',
                    minWidth: 60,
                  }}
                  title={`${item.title} — ${format(item.startDate, 'dd/MM/yyyy')}${item.endDate ? ' → ' + format(item.endDate, 'dd/MM/yyyy') : ''}`}
                >
                  <Folder className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
              );
            })}

            {visibleItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Nenhum item neste período
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border bg-card/50 px-4 py-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.planning }} /> Planejamento</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.active }} /> Ativo</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.paused }} /> Pausado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.finished }} /> Finalizado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--accent))' }} /> Ideia</span>
      </div>
    </div>
  );
}
