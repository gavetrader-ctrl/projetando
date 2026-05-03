import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project } from '@/types/project';
import { differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

interface ProjectTimeChartProps {
  projects: Project[];
}

function calcWorkedHours(project: Project): number {
  return project.activities.reduce((total, act) => {
    if (act.startTime && act.endTime) {
      const [sh, sm] = act.startTime.split(':').map(Number);
      const [eh, em] = act.endTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) return total + diff / 60;
    }
    return total;
  }, 0);
}

function calcProjectDurationDays(project: Project): number {
  if (!project.startDate) return 0;
  const start = new Date(project.startDate);
  const end = project.endDate ? new Date(project.endDate) : new Date();
  const days = differenceInDays(end, start);
  return Math.max(days, 0);
}

function calcActiveDays(project: Project): number {
  const dates = new Set<string>();
  project.activities.forEach(act => {
    if (act.date) dates.add(act.date.slice(0, 10));
  });
  return dates.size;
}

export function ProjectTimeChart({ projects }: ProjectTimeChartProps) {
  const [sortBy, setSortBy] = useState<'diasDesdeInicio' | 'diasAtivos'>('diasDesdeInicio');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const data = useMemo(() => {
    const items = projects
      .filter(p => p.activities.length > 0 || p.startDate)
      .map(p => {
        const workedHours = Math.round(calcWorkedHours(p) * 10) / 10;
        const totalDays = calcProjectDurationDays(p);
        const activeDays = calcActiveDays(p);
        return {
          name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
          horasTrabalhadas: workedHours,
          diasAtivos: activeDays,
          diasDesdeInicio: totalDays,
        };
      });
    items.sort((a, b) => sortDir === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]);
    return items;
  }, [projects, sortBy, sortDir]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Nenhum projeto com atividades ou datas definidas para exibir no gráfico.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Tempo por Projeto</h3>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diasDesdeInicio">Dias desde o Início</SelectItem>
              <SelectItem value="diasAtivos">Dias com Atividade</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            title={sortDir === 'asc' ? 'Mais antigo para mais recente' : 'Mais recente para mais antigo'}
          >
            {sortDir === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />}
            {sortDir === 'asc' ? 'Antigo → Recente' : 'Recente → Antigo'}
          </Button>
        </div>
      </div>
      <div className="h-64 overflow-x-auto overflow-y-hidden">
        <div style={{ width: Math.max(data.length * 80, 600), height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  horasTrabalhadas: 'Horas Trabalhadas',
                  diasAtivos: 'Dias com Atividade',
                  diasDesdeInicio: 'Dias desde o Início',
                };
                const unit = name === 'horasTrabalhadas' ? 'h' : 'd';
                return [`${value}${unit}`, labels[name] || name];
              }}
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  horasTrabalhadas: 'Horas Trabalhadas',
                  diasAtivos: 'Dias com Atividade',
                  diasDesdeInicio: 'Dias desde o Início',
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="horasTrabalhadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="diasAtivos" fill="hsl(var(--chart-2, 142 71% 45%))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="diasDesdeInicio" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
