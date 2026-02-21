import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project } from '@/types/project';
import { differenceInDays } from 'date-fns';

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
  const data = useMemo(() => {
    return projects
      .filter(p => p.activities.length > 0 || p.startDate)
      .map(p => {
        const workedHours = Math.round(calcWorkedHours(p) * 10) / 10;
        const totalDays = calcProjectDurationDays(p);
        const activeDays = calcActiveDays(p);
        const idleDays = Math.max(totalDays - activeDays, 0);
        return {
          name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
          horasTrabalhadas: workedHours,
          diasAtivos: activeDays,
          diasOciosos: idleDays,
        };
      });
  }, [projects]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Nenhum projeto com atividades ou datas definidas para exibir no gráfico.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Tempo por Projeto</h3>
      <div className="h-64">
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
                  diasOciosos: 'Dias sem Atividade',
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
                  diasOciosos: 'Dias sem Atividade',
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="horasTrabalhadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="diasAtivos" fill="hsl(var(--chart-2, 142 71% 45%))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="diasOciosos" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
